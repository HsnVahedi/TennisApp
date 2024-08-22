locals {
  safe_prefix  = replace(var.prefix, "-", "")
  safe_postfix = replace(var.postfix, "-", "")
}


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


resource "azurerm_log_analytics_workspace" "backend-log-analytics" {
  name                = "backend-log-analytics-${local.safe_prefix}${local.safe_postfix}${var.environment}"
  location            = module.resource_group.location
  resource_group_name = module.resource_group.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}


resource "azurerm_container_app_environment" "aca-environment" {
  name                       = "aca-environment-${local.safe_prefix}${local.safe_postfix}${var.environment}"
  location                   = module.resource_group.location
  resource_group_name        = module.resource_group.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.backend-log-analytics.id
}

resource "azurerm_container_app" "backend" {
  name                         = "backend-${local.safe_prefix}${local.safe_postfix}${var.environment}"
  container_app_environment_id = azurerm_container_app_environment.aca-environment.id
  resource_group_name          = module.resource_group.name
  revision_mode                = "Single"

  template {
    container {
      name   = "backend"
      image  = "${module.container_registry.name}.azurecr.io/backend-${var.branch_name}"
      cpu    = 0.25
      memory = "0.5Gi" 
    }
  }

  secret {
    name  = "container-registry-password"
    value = module.container_registry.admin_password
  }

  registry {
    server   = "${module.container_registry.name}.azurecr.io"
    username = module.container_registry.admin_username
    password_secret_name = "container-registry-password" 
  }
}


resource "random_password" "db_admin_password" {
  length  = 16
  special = true
}

resource "random_id" "db_admin_username" {
  byte_length = 8
}

resource "azurerm_postgresql_server" "db" {
  name                = "psql-server-${local.safe_prefix}${local.safe_postfix}${var.environment}"
  location            = module.resource_group.location
  resource_group_name = module.resource_group.name

  administrator_login          = random_id.db_admin_username.hex
  administrator_login_password = random_password.db_admin_password.result

  version                      = "13"
  sku_name                     = "GP_Gen5_2"
  storage_mb                   = 5120
  backup_retention_days        = 7
  geo_redundant_backup_enabled = false
  auto_grow_enabled            = true

  public_network_access_enabled = false
  ssl_enforcement_enabled       = true  # Add this line

  tags = local.tags
}


resource "azurerm_postgresql_database" "db" {
  name                = "backend_db"
  resource_group_name = module.resource_group.name
  server_name         = azurerm_postgresql_server.db.name
  charset             = "UTF8"
  collation           = "English_United States.1252"
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
