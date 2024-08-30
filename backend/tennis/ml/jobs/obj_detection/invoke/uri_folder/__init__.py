from django.conf import settings
from azure.identity import ClientSecretCredential
from azure.ai.ml import MLClient, Input
from storage.media import download_dir_from_media
import shutil
import os


def invoke(input_path: str, endpoint_name: str, deployment_name: str) -> str:
    print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    print(f'Invoking the endpoint: {endpoint_name} with the deployment: {deployment_name} with input_path: {input_path}')
    print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    input_path = download_dir_from_media(input_path)
    print('RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR')
    print('RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR')
    print(f'downloaded path: {input_path}')
    print('RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR')
    print('RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR')
    print('LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL')
    print('LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL')
    print(f'downloaded dir:', os.listdir(input_path))
    print('LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL')
    print('LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL')
    print('TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT')
    print('TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT')
    print(f'temp:', os.listdir('temp'))
    print('TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT')
    print('TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT')
    credential = ClientSecretCredential(
        settings.TENANT_ID, settings.CLIENT_ID, settings.CLIENT_SECRET
    )
    ml_client = MLClient(
        credential, settings.SUBSCRIPTION_ID, settings.RESOURCE_GROUP, settings.WORKSPACE_NAME
    )
    input_data = Input(path=input_path, type="uri_folder")
    print('IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII')
    print('IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII')
    print(f'input_data: {input_data}')
    print(f'tenant_id:', settings.TENANT_ID)
    print(f'client_id:', settings.CLIENT_ID)
    print(f'client_secret:', settings.CLIENT_SECRET)
    print(f'subscription_id:', settings.SUBSCRIPTION_ID)
    print(f'resource_group:', settings.RESOURCE_GROUP)
    print(f'workspace_name:', settings.WORKSPACE_NAME)
    print('IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII')
    print('IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII')

    response = ml_client.batch_endpoints.invoke(
        endpoint_name=endpoint_name,
        deployment_name=deployment_name,
        inputs={"input_data": input_data}
    )
    job_id = response.name
    print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    print(f'Successfully invoked the endpoint: {endpoint_name} with the deployment: {deployment_name}')
    print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    shutil.rmtree(input_path)
    return job_id