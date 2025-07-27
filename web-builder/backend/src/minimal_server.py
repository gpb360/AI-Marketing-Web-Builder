"""
Minimal HTTP server for AI Marketing Web Builder Platform
This runs without external dependencies while we get FastAPI working
"""

import http.server
import socketserver
import json
import urllib.parse
from datetime import datetime

PORT = 8000

class AIMarketingHandler(http.server.BaseHTTPRequestHandler):
    """Custom handler for AI Marketing API endpoints."""
    
    def do_GET(self):
        """Handle GET requests."""
        parsed_path = urllib.parse.urlparse(self.path)
        path = parsed_path.path
        
        # Route the requests
        if path == '/':
            self.send_json_response({
                "message": "AI Marketing Web Builder Platform",
                "version": "0.1.0",
                "status": "running",
                "timestamp": datetime.now().isoformat()
            })
        elif path == '/health':
            self.send_json_response({
                "status": "healthy",
                "timestamp": datetime.now().isoformat()
            })
        elif path == '/api/status':
            self.send_json_response({
                "api": {
                    "name": "AI Marketing Web Builder Platform",
                    "version": "0.1.0",
                    "environment": "development"
                },
                "services": {
                    "server": "running",
                    "database": "pending",
                    "redis": "pending"
                },
                "features": {
                    "workflow_automation": "ready",
                    "crm_integration": "ready",
                    "campaign_management": "ready"
                }
            })
        elif path == '/api/workflows':
            self.send_json_response({
                "workflows": [],
                "total": 0,
                "message": "Workflow system ready for implementation"
            })
        elif path == '/api/campaigns':
            self.send_json_response({
                "campaigns": [],
                "total": 0,
                "message": "Campaign system ready for implementation"
            })
        else:
            self.send_json_response({
                "error": "Endpoint not found",
                "path": path
            }, status_code=404)
    
    def do_POST(self):
        """Handle POST requests."""
        self.send_json_response({
            "message": "POST endpoint ready",
            "path": self.path
        })
    
    def send_json_response(self, data, status_code=200):
        """Send JSON response."""
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        
        response_json = json.dumps(data, indent=2)
        self.wfile.write(response_json.encode('utf-8'))
    
    def log_message(self, format, *args):
        """Override to customize logging."""
        print(f"[{datetime.now().isoformat()}] {format % args}")

if __name__ == "__main__":
    print(f"""
🚀 AI Marketing Web Builder Platform - Backend Server
=====================================
Server starting on http://localhost:{PORT}

Available endpoints:
- GET  /              - Root API info
- GET  /health        - Health check
- GET  /api/status    - Detailed status
- GET  /api/workflows - Workflows (placeholder)
- GET  /api/campaigns - Campaigns (placeholder)

Press Ctrl+C to stop the server
=====================================
    """)
    
    with socketserver.TCPServer(("", PORT), AIMarketingHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\n🛑 Server stopped")
            httpd.shutdown()