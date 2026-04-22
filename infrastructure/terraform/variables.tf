variable "gcp_project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "your-project-id"
}

variable "gcp_region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment"
  type        = string
  default     = "production"
}