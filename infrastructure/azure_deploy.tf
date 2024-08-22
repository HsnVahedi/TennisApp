# Resource group

module "resource_group" {
  source = "./modules/resource-group"

  location = var.location

  prefix  = var.prefix
  postfix = var.postfix
  env = var.environment

  tags = local.tags
}


module "container_registry" {
  source = "./modules/container-registry"

  rg_name  = module.resource_group.name
  location = module.resource_group.location

  prefix  = var.prefix
  postfix = var.postfix
  env = var.environment

  tags = local.tags
}


# Backend Service
module "backend_app" {
  source  = "Azure/container-apps/azurerm"
  version = "1.0.0"

  name                = "backend${local.safe_prefix}${local.safe_postfix}${var.env}"
  resource_group_name = module.resource_group.name
  location            = var.location
  environment_name    = "${var.prefix}-env-${var.environment}"
  container_registry = {
    server   = module.container_registry.login_server
    username = module.container_registry.admin_username
    password = module.container_registry.admin_password
  }

  containers = [
    {
      name  = "backend"
      image = "${module.container_registry.login_server}/backend:${var.environment}"
      cpu   = 0.5
      memory = "1.0Gi"
      ports = [{
        port     = 8000
        protocol = "TCP"
      }]
    }
  ]

  tags = local.tags
}

# Frontend Service
module "frontend_app" {
  source  = "Azure/container-apps/azurerm"
  version = "1.0.0"

  name                = "frontend${local.safe_prefix}${local.safe_postfix}${var.env}"
  resource_group_name = module.resource_group.name
  location            = var.location
  environment_name    = "${var.prefix}-env-${var.environment}"
  container_registry = {
    server   = module.container_registry.login_server
    username = module.container_registry.admin_username
    password = module.container_registry.admin_password
  }

  containers = [
    {
      name  = "frontend"
      image = "${module.container_registry.login_server}/frontend:${var.environment}"
      cpu   = 0.5
      memory = "1.0Gi"
      ports = [{
        port     = 3000
        protocol = "TCP"
      }]
    }
  ]

  tags = local.tags
}

# Celery Service
module "celery_app" {
  source  = "Azure/container-apps/azurerm"
  version = "1.0.0"

  name                = "celery${local.safe_prefix}${local.safe_postfix}${var.env}"
  resource_group_name = module.resource_group.name
  location            = var.location
  environment_name    = "${var.prefix}-env-${var.environment}"
  container_registry = {
    server   = module.container_registry.login_server
    username = module.container_registry.admin_username
    password = module.container_registry.admin_password
  }

  containers = [
    {
      name  = "celery"
      image = "${module.container_registry.login_server}/celery:${var.environment}"
      cpu   = 0.5
      memory = "1.0Gi"
    }
  ]

  tags = local.tags
}


# # Azure Machine Learning workspace

# module "aml_workspace" {
#   source = "./modules/aml-workspace"

#   rg_name  = module.resource_group.name
#   location = module.resource_group.location

#   prefix  = var.prefix
#   postfix = var.postfix
#   env = var.environment

#   storage_account_id      = module.storage_account_aml.id
#   key_vault_id            = module.key_vault.id
#   application_insights_id = module.application_insights.id
#   container_registry_id   = module.container_registry.id

#   enable_aml_computecluster = var.enable_aml_computecluster
#   storage_account_name      = module.storage_account_aml.name

#   tags = local.tags
# }

# # Storage account

# module "storage_account_aml" {
#   source = "./modules/storage-account"

#   rg_name  = module.resource_group.name
#   location = module.resource_group.location

#   prefix  = var.prefix
#   postfix = var.postfix
#   env = var.environment

#   hns_enabled                         = false
#   firewall_bypass                     = ["AzureServices"]
#   firewall_virtual_network_subnet_ids = []

#   tags = local.tags
# }

# # Key vault

# module "key_vault" {
#   source = "./modules/key-vault"

#   rg_name  = module.resource_group.name
#   location = module.resource_group.location

#   prefix  = var.prefix
#   postfix = var.postfix
#   env = var.environment

#   tags = local.tags
# }

# # Application insights

# module "application_insights" {
#   source = "./modules/application-insights"

#   rg_name  = module.resource_group.name
#   location = module.resource_group.location

#   prefix  = var.prefix
#   postfix = var.postfix
#   env = var.environment

#   tags = local.tags
# }

# module "data_explorer" {
#   source = "./modules/data-explorer"

#   rg_name  = module.resource_group.name
#   location = module.resource_group.location

#   prefix  = var.prefix
#   postfix = var.postfix
#   env = var.environment
#   key_vault_id      = module.key_vault.id
#   enable_monitoring = var.enable_monitoring

#   client_secret = var.client_secret

#   tags = local.tags
# }
