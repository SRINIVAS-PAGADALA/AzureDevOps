variable "tenant_id" {
  description = "Azure tenant ID used for authentication."
  type        = string
  default     = "4e185917-49f1-4bd6-a1bf-a9c0ecc4e755"
}

variable "subscription_id" {
  description = "Azure subscription ID where the storage account will be deployed."
  type        = string
  default     = "224736be-0f7d-42f0-831d-143f1c6d4956"
}

variable "resource_group_name" {
  description = "Name of the existing resource group for the storage account."
  type        = string
  default     = "rg1"
}

variable "storage_account_name" {
  description = "Lowercase prefix for the storage account name. A unique six-character suffix is added automatically."
  type        = string
  default     = "azdevopssa"

  validation {
    condition     = can(regex("^[a-z0-9]{3,18}$", var.storage_account_name))
    error_message = "storage_account_name must be 3 to 18 characters and contain only lowercase letters and numbers."
  }
}

variable "account_kind" {
  description = "Storage account kind."
  type        = string
  default     = "StorageV2"

  validation {
    condition     = contains(["StorageV2", "BlobStorage", "BlockBlobStorage", "FileStorage"], var.account_kind)
    error_message = "account_kind must be StorageV2, BlobStorage, BlockBlobStorage, or FileStorage."
  }
}

variable "account_tier" {
  description = "Performance tier for the storage account."
  type        = string
  default     = "Standard"

  validation {
    condition     = contains(["Standard", "Premium"], var.account_tier)
    error_message = "account_tier must be Standard or Premium."
  }
}

variable "account_replication_type" {
  description = "Replication type for the storage account."
  type        = string
  default     = "LRS"

  validation {
    condition     = contains(["LRS", "GRS", "RAGRS", "ZRS", "GZRS", "RAGZRS"], var.account_replication_type)
    error_message = "account_replication_type must be LRS, GRS, RAGRS, ZRS, GZRS, or RAGZRS."
  }
}
