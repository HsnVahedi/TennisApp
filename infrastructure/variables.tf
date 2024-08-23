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

  validation {
    condition     = length(var.branch_name) > 0
    error_message = "The branch_name variable must not be empty."
  }
}

variable "db_admin_username" {
  description = "The administrator login name for the PostgreSQL server."
  type        = string
  default     = "artoftennis"
}

variable "image_digest" {
  description = "The digest of the Docker image to be used in the container app."
  type        = string
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
