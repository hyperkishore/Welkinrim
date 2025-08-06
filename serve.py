#!/usr/bin/env python3
"""
Simple HTTP server for local development of WelkinRim website
Usage: python3 serve.py [port]
Default port: 8000
"""

import http.server
import socketserver
import sys
import os
import webbrowser
from pathlib import Path

def main():
    # Set port (default to 8000)
    port = 8000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("Invalid port number. Using default port 8000.")
    
    # Change to script directory
    os.chdir(Path(__file__).parent)
    
    # Simple handler for local development
    Handler = http.server.SimpleHTTPRequestHandler
    
    try:
        # Create server
        with socketserver.TCPServer(("", port), Handler) as httpd:
            server_url = f"http://localhost:{port}"
            print(f"🚀 WelkinRim website server starting...")
            print(f"📡 Server running at: {server_url}")
            print(f"📁 Serving files from: {os.getcwd()}")
            print(f"🌐 Opening website in your default browser...")
            print(f"⚡ Press Ctrl+C to stop the server")
            print("-" * 50)
            
            # Open website in default browser
            webbrowser.open(server_url)
            
            # Start server
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print(f"\n🛑 Server stopped by user")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {port} is already in use. Try a different port:")
            print(f"   python3 serve.py {port + 1}")
        else:
            print(f"❌ Error starting server: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    main()