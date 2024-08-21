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

output "acr_login_server" {
  value = azurerm_container_registry.main.login_server
}

output "acr_admin_username" {
  value = azurerm_container_registry.main.admin_username
}

output "acr_admin_password" {
  value = azurerm_container_registry.main.admin_password
  sensitive = true
}
