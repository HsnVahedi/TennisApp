from django.conf import settings
from azure.identity import ClientSecretCredential
from azure.ai.ml import MLClient, Input


def invoke(input_path: str, endpoint_name: str, deployment_name: str) -> str:
    print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    print(f'Invoking the endpoint: {endpoint_name} with the deployment: {deployment_name}')
    print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
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
    print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    print(f'Successfully invoked the endpoint: {endpoint_name} with the deployment: {deployment_name}')
    print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    return job_id



