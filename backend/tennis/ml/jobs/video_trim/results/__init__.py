from django.conf import settings
from azure.identity import ClientSecretCredential
from azureml.core.authentication import ServicePrincipalAuthentication
from azure.ai.ml import MLClient
from ml.jobs.status import COMPLETED
from azureml.core import Workspace
import shutil
import os
import glob
import json
from ml.jobs.status import check_status
import uuid
from typing import Dict, List

# Define the result type based on actual RNN output
RNNResult = Dict[str, List[int]]

def get_results(job_id: str) -> RNNResult:
    predictions_path = f"./predictions-{uuid.uuid4()}-{job_id}"
    status = check_status(job_id)
    if status != COMPLETED:
        raise Exception(f"Job not completed. Job status is: {status}")
    
    credential = ClientSecretCredential(
        settings.TENANT_ID, settings.CLIENT_ID, settings.CLIENT_SECRET
    )
    ml_client = MLClient(
        credential, settings.SUBSCRIPTION_ID, settings.RESOURCE_GROUP, settings.WORKSPACE_NAME
    )
    
    rnn_predictions: RNNResult = {}
    ml_client.jobs.stream(name=job_id)
    
    final_job_run_id = None
    for job in ml_client.jobs.list(parent_job_name=job_id):
        final_job_run_id = job.name
    
    if final_job_run_id:   
        sp_auth = ServicePrincipalAuthentication(
            tenant_id=settings.TENANT_ID,
            service_principal_id=settings.CLIENT_ID,
            service_principal_password=settings.CLIENT_SECRET
        )
        workspace = Workspace(
            settings.SUBSCRIPTION_ID, settings.RESOURCE_GROUP, settings.WORKSPACE_NAME,
            auth=sp_auth
        )
        blob_storage = workspace.get_default_datastore()
        prediction_output_path = f"azureml/{final_job_run_id}/score"
        blob_storage.download(
            target_path=predictions_path, prefix=prediction_output_path, overwrite=True,
            show_progress=True,
        )
        
        file_pattern = f'{predictions_path}/azureml/*/score/*.json'
        file_paths = glob.glob(file_pattern)
        for file_path in file_paths:
            with open(file_path, 'r') as file:
                prediction = json.load(file)
                # Here we expect the content of the JSON to directly represent sequence predictions
                rnn_predictions.update(prediction)
    
    shutil.rmtree(predictions_path)
    return rnn_predictions
