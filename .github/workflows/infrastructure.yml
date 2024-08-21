name: Terraform Deployment

on:
  workflow_dispatch:  # Allows the workflow to be manually triggered

jobs:
  terraform:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout repository
      uses: actions/checkout@v2

    - name: Setup Terraform
      uses: hashicorp/setup-terraform@v2
      with:
        terraform_version: 1.5.0  # Specify the Terraform version you want to use

    - name: Azure Login
      uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}

    - name: Terraform Init
      run: terraform init

    - name: Terraform Plan
      run: terraform plan

    - name: Terraform Apply
      run: terraform apply -auto-approve

    - name: Output ACR Information
      run: |
        echo "ACR Login Server: $(terraform output -raw acr_login_server)"
        echo "ACR Admin Username: $(terraform output -raw acr_admin_username)"
        echo "ACR Admin Password: $(terraform output -raw acr_admin_password)"
