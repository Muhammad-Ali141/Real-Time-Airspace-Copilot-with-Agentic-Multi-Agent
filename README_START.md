# Quick Start Guide

## Starting the MCP Server

The MCP server must be running before you can use the React frontend.

### Method 1: Using the Startup Script (Recommended)

From the project root directory:

```bash
python start_mcp_server.py
```

This script will:
- Set the correct working directory
- Display helpful information
- Start the server on `http://localhost:8000`

### Method 2: Manual Start

From the project root directory:

```bash
cd mcp
uvicorn mcp_server:app --reload --port 8000 --host 0.0.0.0
```

### Method 3: Using Python Directly

From the project root directory:

```bash
cd mcp
python -m uvicorn mcp_server:app --reload --port 8000
```

## Verifying the Server is Running

Once started, you should see output like:

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Check Server Health

Open your browser and visit:
- `http://localhost:8000/health` - Should return `{"status": "healthy"}`
- `http://localhost:8000/` - Should return API information
- `http://localhost:8000/docs` - Interactive API documentation

## Common Issues

### Issue: "Connection refused" or "MCP server not found"

**Solution:**
1. Make sure the MCP server is actually running
2. Check that it's listening on port 8000:
   ```bash
   netstat -ano | findstr :8000
   ```
3. Verify the React app is trying to connect to `http://localhost:8000`
4. Check for firewall blocking the connection

### Issue: "No snapshot files found"

**Solution:**
1. Make sure snapshot files exist in the `snapshots/` directory:
   - `snapshots/Region1.json`
   - `snapshots/Region2.json`
   - `snapshots/Region3.json`
   - `snapshots/Region4.json`
   - `snapshots/alerts.json`

2. Run the n8n workflow to generate these files (see `README_N8N_WORKFLOW.md`)

### Issue: "ModuleNotFoundError" when starting server

**Solution:**
Install required dependencies:
```bash
pip install fastapi uvicorn python-multipart pydantic
pip install langchain langchain-groq
pip install requests
```

### Issue: Port 8000 already in use

**Solution:**
1. Find what's using port 8000:
   ```bash
   netstat -ano | findstr :8000
   ```
2. Kill the process or use a different port:
   ```bash
   uvicorn mcp_server:app --reload --port 8001
   ```
3. Update `MCP_SERVER_URL` in `ui/src/App.jsx` to match the new port

## Testing the Server

Once the server is running, you can test it:

```bash
# Health check
curl http://localhost:8000/health

# Get flights from region1
curl http://localhost:8000/flights/region/region1

# Get a specific flight
curl http://localhost:8000/flights/THY4KZ?region=region1

# Get active alerts
curl http://localhost:8000/alerts/active
```

## Next Steps

After the MCP server is running:

1. Start the React frontend (in a new terminal):
   ```bash
   cd ui
   npm install  # first time only
   npm run dev
   ```

2. Open `http://localhost:5173` in your browser

3. The connection status indicator in the header should show "Connected" (green)

