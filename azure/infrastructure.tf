provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "main" {
  name     = "art-of-tennis-rg"
  location = "East US"
}

resource "azurerm_container_registry" "main" {
  name                = "artoftenisacr"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Standard"  # Options: Basic, Standard, Premium

  admin_enabled = true  # Enable admin account to simplify authentication for push/pull operations
}

resource "azurerm_storage_account" "main" {
  name                     = "artoftenisstorage"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_storage_container" "main" {
  name                  = "tfstate"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

resource "azurerm_storage_blob" "terraform" {
  name                   = "terraform.tfstate"
  storage_account_name   = azurerm_storage_account.main.name
  storage_container_name = azurerm_storage_container.main.name
  type                   = "Block"
}

terraform {
  backend "azurerm" {
    resource_group_name  = azurerm_resource_group.main.name
    storage_account_name = azurerm_storage_account.main.name
    container_name       = azurerm_storage_container.main.name
    key                  = "terraform.tfstate"
  }
}


resource "azurerm_container_apps_environment" "main" {
  name                = "art-of-tennis-env"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  managed_certificates_enabled = true

  dns_zone_id = azurerm_dns_zone.main.id
}


resource "azurerm_postgresql_flexible_server" "main" {
  name                = "art-of-tennis-db"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  administrator_login = "db_user"
  administrator_password = "db_password"
  version = "13"

  storage_mb      = 32768
  sku_name        = "Standard_B2ms"
  backup_retention_days = 7

  tags = {
    environment = "dev"
  }
}

resource "azurerm_postgresql_flexible_server_firewall_rule" "main" {
  name                = "allow_all_ips"
  resource_group_name = azurerm_resource_group.main.name
  server_name         = azurerm_postgresql_flexible_server.main.name
  start_ip_address    = "0.0.0.0"
  end_ip_address      = "0.0.0.0"
}


resource "azurerm_redis_cache" "main" {
  name                = "art-of-tennis-redis"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  capacity            = 1
  family              = "C"
  sku_name            = "Standard"
  enable_non_ssl_port = true
}

output "redis_host_name" {
  value = azurerm_redis_cache.main.hostname
}

output "redis_port" {
  value = azurerm_redis_cache.main.port
}





# output "acr_login_server" {
#   value = azurerm_container_registry.main.login_server
# }

# output "acr_admin_username" {
#   value = azurerm_container_registry.main.admin_username
# }

# output "acr_admin_password" {
#   value = azurerm_container_registry.main.admin_password
#   sensitive = true
# }
