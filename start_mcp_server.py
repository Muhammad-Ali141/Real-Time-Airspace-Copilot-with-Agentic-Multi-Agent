#!/usr/bin/env python3
"""
Start script for the MCP FastAPI server.
This script ensures the correct working directory and paths are set.
"""
import os
import sys
import subprocess

# Get the directory where this script is located (project root)
project_root = os.path.dirname(os.path.abspath(__file__))
mcp_dir = os.path.join(project_root, "mcp")

# Change to project root directory so relative paths work correctly
os.chdir(project_root)

print("=" * 60)
print("Starting MCP Server (FastAPI)")
print("=" * 60)
print(f"Project root: {project_root}")
print(f"MCP directory: {mcp_dir}")
print(f"Snapshots directory: {os.path.join(project_root, 'snapshots')}")
print("=" * 60)
print("\nServer will be available at: http://localhost:8000")
print("API docs will be available at: http://localhost:8000/docs")
print("\nPress Ctrl+C to stop the server\n")
print("=" * 60)
print()

# Change to mcp directory to run uvicorn
os.chdir(mcp_dir)

# Run uvicorn
try:
    subprocess.run([
        sys.executable, "-m", "uvicorn",
        "mcp_server:app",
        "--reload",
        "--port", "8000",
        "--host", "0.0.0.0"
    ], check=True)
except KeyboardInterrupt:
    print("\n\nServer stopped by user.")
except subprocess.CalledProcessError as e:
    print(f"\nError starting server: {e}")
    print("\nMake sure you have uvicorn installed:")
    print("  pip install uvicorn fastapi")
    sys.exit(1)

