from django.conf import settings
from azure.identity import ClientSecretCredential
from azure.ai.ml import MLClient, Input
from typing import Literal

COMPLETED = "Completed"
FAILED = "Failed"
CANCELLED = "Cancelled"

JOB_STATUS = Literal[COMPLETED, FAILED, CANCELLED]

def check_status(job_id: str) -> JOB_STATUS:
    credential = ClientSecretCredential(
        settings.TENANT_ID, settings.CLIENT_ID, settings.CLIENT_SECRET
    )
    ml_client = MLClient(
        credential, settings.SUBSCRIPTION_ID, settings.RESOURCE_GROUP, settings.WORKSPACE_NAME
    )
    job_status = ml_client.jobs.get(job_id).status
    return job_status