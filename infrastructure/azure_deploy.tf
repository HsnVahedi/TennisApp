
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

resource "azurerm_postgresql_server" "db" {
  name                = "psql-server-${local.safe_prefix}${local.safe_postfix}${var.environment}"
  location            = module.resource_group.location
  resource_group_name = module.resource_group.name

  administrator_login          = var.db_admin_username
  administrator_login_password = random_password.db_admin_password.result

  version                      = "11"
  sku_name                     = "GP_Gen5_2"
  storage_mb                   = 5120
  backup_retention_days        = 7
  geo_redundant_backup_enabled = false
  auto_grow_enabled            = true

  public_network_access_enabled = false  # Disable public access
  ssl_enforcement_enabled       = true

  tags = local.tags
}

resource "azurerm_postgresql_database" "db" {
  name                = "backend_db"
  resource_group_name = module.resource_group.name
  server_name         = azurerm_postgresql_server.db.name
  charset             = "UTF8"
  collation           = "English_United States.1252"
}

# resource "azurerm_container_app_environment" "aca-environment" {
#   name                       = "aca-environment-${local.safe_prefix}${local.safe_postfix}${var.environment}"
#   location                   = module.resource_group.location
#   resource_group_name        = module.resource_group.name
# }



resource "azurerm_container_app_environment" "aca-environment" {
  name                       = "aca-environment-${local.safe_prefix}${local.safe_postfix}${var.environment}"
  location                   = module.resource_group.location
  resource_group_name        = module.resource_group.name

  vnet_integration {
    subnet_id = azurerm_subnet.subnet.id
  }
}

resource "azurerm_container_app" "backend" {
  name                         = "backend-${local.safe_prefix}${local.safe_postfix}${var.environment}"
  container_app_environment_id = azurerm_container_app_environment.aca-environment.id
  resource_group_name          = module.resource_group.name
  revision_mode                = "Single"

  template {
    container {
      name   = "backend"
      image  = "${module.container_registry.name}.azurecr.io/backend-${var.branch_name}@${var.image_digest}"
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name  = "DATABASE_HOST"
        value = azurerm_postgresql_server.db.fqdn
      }

      env {
        name  = "DATABASE_USER"
        value = "${var.db_admin_username}@${azurerm_postgresql_server.db.name}"
      }

      env {
        name  = "DATABASE_PASSWORD"
        value = random_password.db_admin_password.result
      }

      env {
        name  = "DATABASE_NAME"
        value = azurerm_postgresql_database.db.name
      }

      env {
        name  = "DATABASE_PORT"
        value = "5432"
      }

      env {
        name  = "PYTHONUNBUFFERED"
        value = "1"
      }

      env {
        name  = "IS_PROD"
        value = "True"
      }
    }
  }

  secret {
    name  = "container-registry-password"
    value = module.container_registry.admin_password
  }

  registry {
    server             = "${module.container_registry.name}.azurecr.io"
    username           = module.container_registry.admin_username
    password_secret_name = "container-registry-password"
  }

  tags = local.tags
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
#         value = azurerm_postgresql_server.db.fqdn
#       }

#       env {
#         name  = "DATABASE_USER"
#         value = "${var.db_admin_username}@${azurerm_postgresql_server.db.name}"
#       }

#       env {
#         name  = "DATABASE_PASSWORD"
#         value = random_password.db_admin_password.result
#       }

#       env {
#         name  = "DATABASE_NAME"
#         value = azurerm_postgresql_database.db.name
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




resource "azurerm_private_endpoint" "postgresql_endpoint" {
  name                = "postgresql-endpoint-${local.safe_prefix}${local.safe_postfix}${var.environment}"
  location            = module.resource_group.location
  resource_group_name = module.resource_group.name
  subnet_id           = azurerm_subnet.subnet.id
  private_service_connection {
    name                           = "postgresql-connection"
    private_connection_resource_id = azurerm_postgresql_server.db.id
    subresource_names              = ["postgresqlServer"]
    is_manual_connection           = false
  }
}




resource "azurerm_virtual_network" "vnet" {
  name                = "vnet-${local.safe_prefix}${local.safe_postfix}${var.environment}"
  location            = var.location
  resource_group_name = module.resource_group.name
  address_space       = ["10.0.0.0/16"]
}


resource "azurerm_subnet" "subnet" {
  name                 = "subnet-${local.safe_prefix}${local.safe_postfix}${var.environment}"
  resource_group_name  = module.resource_group.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.1.0/24"]
}



