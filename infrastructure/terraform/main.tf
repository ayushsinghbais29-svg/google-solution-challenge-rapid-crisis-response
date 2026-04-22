# Google Cloud Provider
provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# Cloud Run - API Server
resource "google_cloud_run_service" "api_server" {
  name     = "api-server"
  location = var.gcp_region

  template {
    spec {
      containers {
        image = "gcr.io/${var.gcp_project_id}/api-server:latest"
        
        ports {
          container_port = 3000
        }

        env {
          name  = "PORT"
          value = "3000"
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Cloud Run - Gemini Service
resource "google_cloud_run_service" "gemini_service" {
  name     = "gemini-service"
  location = var.gcp_region

  template {
    spec {
      containers {
        image = "gcr.io/${var.gcp_project_id}/gemini-service:latest"
        
        ports {
          container_port = 3001
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Cloud Run - Vertex AI Service
resource "google_cloud_run_service" "vertex_ai_service" {
  name     = "vertex-ai-service"
  location = var.gcp_region

  template {
    spec {
      containers {
        image = "gcr.io/${var.gcp_project_id}/vertex-ai-service:latest"
        
        ports {
          container_port = 3002
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Cloud Run - Vision Service
resource "google_cloud_run_service" "vision_service" {
  name     = "vision-service"
  location = var.gcp_region

  template {
    spec {
      containers {
        image = "gcr.io/${var.gcp_project_id}/vision-service:latest"
        
        ports {
          container_port = 3003
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Cloud Run - WebSocket Server
resource "google_cloud_run_service" "websocket_server" {
  name     = "websocket-server"
  location = var.gcp_region

  template {
    spec {
      containers {
        image = "gcr.io/${var.gcp_project_id}/websocket-server:latest"
        
        ports {
          container_port = 8080
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Firestore Database
resource "google_firestore_database" "database" {
  project     = var.gcp_project_id
  name        = "default"
  location_id = "us-central1"
  type        = "FIRESTORE_NATIVE"
}

# Pub/Sub Topic for Incidents
resource "google_pubsub_topic" "incidents" {
  name = "incidents-topic"
}

# Pub/Sub Subscription
resource "google_pubsub_subscription" "incidents_subscription" {
  name             = "incidents-subscription"
  topic            = google_pubsub_topic.incidents.name
  ack_deadline_seconds = 60
}

# Cloud Storage Bucket
resource "google_storage_bucket" "incident_logs" {
  name          = "${var.gcp_project_id}-incident-logs"
  location      = var.gcp_region
  force_destroy = true
}