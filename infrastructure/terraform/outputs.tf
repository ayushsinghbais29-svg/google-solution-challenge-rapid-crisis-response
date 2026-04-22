output "api_server_url" {
  value       = google_cloud_run_service.api_server.status[0].url
  description = "API Server URL"
}

output "gemini_service_url" {
  value       = google_cloud_run_service.gemini_service.status[0].url
  description = "Gemini Service URL"
}

output "vertex_ai_service_url" {
  value       = google_cloud_run_service.vertex_ai_service.status[0].url
  description = "Vertex AI Service URL"
}

output "vision_service_url" {
  value       = google_cloud_run_service.vision_service.status[0].url
  description = "Vision Service URL"
}

output "websocket_server_url" {
  value       = google_cloud_run_service.websocket_server.status[0].url
  description = "WebSocket Server URL"
}

output "firestore_database_id" {
  value       = google_firestore_database.database.name
  description = "Firestore Database ID"
}