variable "location" {
  type        = string
  description = "Location of the resource group and modules"
}

variable "prefix" {
  type        = string
  description = "Prefix for module names"
}

variable "environment" {
  type        = string
  description = "Environment information"
}

variable "postfix" {
  type        = string
  description = "Postfix for module names"
}

variable "branch_name" {
  type        = string
  description = "Git branch name"
}

variable "db_admin_username" {
  description = "The administrator login name for the PostgreSQL server."
  type        = string
  default     = "artoftennis"
}

# variable "enable_aml_computecluster" {
#   description = "Variable to enable or disable AML compute cluster"
# }

# variable "enable_monitoring" {
#   description = "Variable to enable or disable Monitoring"
# }

variable "client_secret" {
  description = "Service Principal Secret"
}
