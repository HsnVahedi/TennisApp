from django.conf import settings
from azure.identity import ClientSecretCredential
from azure.ai.ml import MLClient, Input
from storage.media import download_dir_from_media
import shutil
import os


def invoke(input_path: str, endpoint_name: str, deployment_name: str) -> str:
    print(f'Invoking the endpoint: {endpoint_name} with the deployment: {deployment_name} with input_path: {input_path}')
    input_path = download_dir_from_media(input_path)
    print('LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL')
    print('LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL')
    print(f'{endpoint_name} - downloaded dir:', os.listdir(input_path))
    print('LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL')
    print('LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL')
    credential = ClientSecretCredential(
        settings.TENANT_ID, settings.CLIENT_ID, settings.CLIENT_SECRET
    )
    ml_client = MLClient(
        credential, settings.SUBSCRIPTION_ID, settings.RESOURCE_GROUP, settings.WORKSPACE_NAME
    )
    input_data = Input(path=input_path, type="uri_folder")

    response = ml_client.batch_endpoints.invoke(
        endpoint_name=endpoint_name,
        deployment_name=deployment_name,
        inputs={"input_data": input_data}
    )
    job_id = response.name
    shutil.rmtree(input_path)
    return job_id