locals {
  safe_prefix  = replace(var.prefix, "-", "")
  safe_postfix = replace(var.postfix, "-", "")
}

module "resource_group" {
  source = "./modules/resource-group"

  location = var.location
  prefix   = var.prefix
  postfix  = var.postfix
  env      = var.environment
  tags     = local.tags
}

module "container_registry" {
  source = "./modules/container-registry"

  rg_name  = module.resource_group.name
  location = module.resource_group.location
  prefix   = var.prefix
  postfix  = var.postfix
  env      = var.environment
  tags     = local.tags
}

resource "random_password" "db_admin_password" {
  length  = 16
  special = true
}

resource "azurerm_postgresql_flexible_server" "db" {
  name                = "psql-server-${local.safe_prefix}${local.safe_postfix}${var.environment}"
  location            = module.resource_group.location
  resource_group_name = module.resource_group.name

  administrator_login    = var.db_admin_username
  administrator_password = random_password.db_admin_password.result

  version = "12"
  sku_name = "GP_Standard_D2s_v3"

  storage_mb = 32768

  backup_retention_days        = 7
  geo_redundant_backup_enabled = false

  high_availability {
    mode = "ZoneRedundant"
  }

  tags = local.tags
}

resource "azurerm_postgresql_flexible_server_database" "db" {
  name       = "backend_db"
  server_id  = azurerm_postgresql_flexible_server.db.id
  charset    = "UTF8"
}

resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure_ips" {
  name                = "allow_azure_ips"
  server_id           = azurerm_postgresql_flexible_server.db.id
  start_ip_address    = "0.0.0.0"
  end_ip_address      = "0.0.0.0"
}

resource "azurerm_container_app_environment" "aca-environment" {
  name                       = "aca-environment-${local.safe_prefix}${local.safe_postfix}${var.environment}"
  location                   = module.resource_group.location
  resource_group_name        = module.resource_group.name
}



# resource "azurerm_container_app" "backend" {
#   name                         = "backend-${local.safe_prefix}${local.safe_postfix}${var.environment}"
#   container_app_environment_id = azurerm_container_app_environment.aca-environment.id
#   resource_group_name          = module.resource_group.name
#   revision_mode                = "Single"

#   template {
#     container {
#       name   = "backend"
#       image  = "${module.container_registry.name}.azurecr.io/backend-${var.branch_name}@${var.image_digest}"
#       cpu    = 0.25
#       memory = "0.5Gi"

#       env {
#         name  = "DATABASE_HOST"
#         value = azurerm_postgresql_flexible_server.db.fqdn
#       }

#       env {
#         name  = "DATABASE_USER"
#         value = "${var.db_admin_username}@${azurerm_postgresql_flexible_server.db.name}"
#       }

#       env {
#         name  = "DATABASE_PASSWORD"
#         value = random_password.db_admin_password.result
#       }

#       env {
#         name  = "DATABASE_NAME"
#         value = azurerm_postgresql_flexible_database.db.name
#       }
 
#       env {
#         name  = "DATABASE_PORT"
#         value = "5432"
#       }

#       env {
#         name  = "PYTHONUNBUFFERED"
#         value = "1"
#       }

#       env {
#         name  = "IS_PROD"
#         value = "True"
#       }
#     }
#   }

#   secret {
#     name  = "container-registry-password"
#     value = module.container_registry.admin_password
#   }

#   registry {
#     server   = "${module.container_registry.name}.azurecr.io"
#     username = module.container_registry.admin_username
#     password_secret_name = "container-registry-password"
#   }

#   tags = local.tags
# }







