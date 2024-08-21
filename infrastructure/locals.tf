locals {
  tags = {
    Owner       = "tennis-devops"
    Project     = "tennis-devops"
    Environment = "${var.environment}"
    Toolkit     = "terraform"
    Name        = "${var.prefix}"
  }
}