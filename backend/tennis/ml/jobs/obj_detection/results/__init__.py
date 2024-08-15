from django.conf import settings
from azure.identity import ClientSecretCredential
from azureml.core.authentication import ServicePrincipalAuthentication
from azure.ai.ml import MLClient
from ml.jobs.status import COMPLETED
from typing import Dict, List
from azureml.core import Workspace
import shutil
import os
import glob
import json
from ml.jobs.status import check_status


Result = Dict[str, Dict[str, List[List[float]]]]

def get_results(job_id: str) -> Result:
    predictions_path = f"./predictions-{job_id}"
    status = check_status(job_id)
    if status != COMPLETED:
        raise Exception(f"Job not completed. Job status is: {status}")
    credential = ClientSecretCredential(
        settings.TENANT_ID, settings.CLIENT_ID, settings.CLIENT_SECRET
    )
    ml_client = MLClient(
        credential, settings.SUBSCRIPTION_ID, settings.RESOURCE_GROUP, settings.WORKSPACE_NAME
    )
    detections: Result = {}
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
            # show_progress=True,
            show_progress=False,
        )
        file_pattern = f'{predictions_path}/azureml/*/score/*.json'
        file_paths = glob.glob(file_pattern)
        for file_path in file_paths:
            with open(file_path, 'r') as file:
                try:
                    prediction = json.load(file)
                except Exception:
                    prediction = {}
                    print('TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT')
                    print('TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT')
                    print('TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT')
                    print('TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT')
                    print(f'file_path: {file_path}. json.load error', )
                    print('TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT')
                    print('TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT')
                    print('TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT')
                    print('TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT')
                detections[file_path] = prediction
    shutil.rmtree(predictions_path)
    return detections