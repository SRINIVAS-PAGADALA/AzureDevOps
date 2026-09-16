terraform {
  required_version = ">= 1.5.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

provider "azurerm" {
  features {}

  tenant_id       = var.tenant_id
  subscription_id = var.subscription_id
}

provider "random" {}

data "azurerm_resource_group" "target" {
  name = var.resource_group_name
}

resource "random_string" "storage_account_suffix" {
  length  = 6
  lower   = true
  numeric = true
  special = false
  upper   = false
}

resource "azurerm_storage_account" "this" {
  name                     = "${var.storage_account_name}${random_string.storage_account_suffix.result}"
  resource_group_name      = data.azurerm_resource_group.target.name
  location                 = data.azurerm_resource_group.target.location
  account_kind             = var.account_kind
  account_tier             = var.account_tier
  account_replication_type = var.account_replication_type

  min_tls_version                 = "TLS1_2"
  public_network_access_enabled   = true
  allow_nested_items_to_be_public = false
}
