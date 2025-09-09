# MCP-Hack API Test Plan

## 3-Step Test Plan with curl Commands

### Step 1: Test API Information Endpoint
**Purpose**: Verify the server is running and accessible

```bash
curl -X GET "https://mcp-hack.onrender.com/" \
  -H "Accept: text/plain" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -v
```

**Expected Response**:
- **HTTP Status**: 200 OK
- **Content-Type**: text/plain
- **Body**: 
```
HTTP test server for MCP gateway
GET  /tools -> list tools
POST /call -> { name, arguments }
```

### Step 2: List Available Tools
**Purpose**: Retrieve all available MCP tools and verify tool discovery

```bash
curl -X GET "https://mcp-hack.onrender.com/tools" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -v
```

**Expected Response**:
- **HTTP Status**: 200 OK
- **Content-Type**: application/json
- **Body Structure**:
```json
[
  {
    "name": "slack_list_channels",
    "description": "List public or pre-defined channels in the workspace with pagination"
  },
  {
    "name": "slack_post_message", 
    "description": "Post a new message to a Slack channel"
  },
  {
    "name": "create_repository",
    "description": "Create a new GitHub repository"
  }
]
```

### Step 3: Execute a Tool (Slack List Channels)
**Purpose**: Test tool execution with a safe, read-only operation

```bash
curl -X POST "https://mcp-hack.onrender.com/call" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -d '{
    "name": "slack_list_channels",
    "arguments": {
      "limit": 10
    }
  }' \
  -v
```

**Expected Response**:
- **HTTP Status**: 200 OK (successful execution) or 500 (if Slack token not configured)
- **Content-Type**: application/json
- **Success Body Structure**:
```json
{
  "ok": true,
  "result": {
    "ok": true,
    "channels": [
      {
        "id": "C1234567890",
        "name": "general",
        "is_private": false
      }
    ]
  }
}
```
- **Error Body Structure** (if Slack not configured):
```json
{
  "ok": false,
  "error": "SLACK_BOT_TOKEN not set"
}
```

## Alternative Test Commands

### Test with Elicitation (Slack Post Message)
**Note**: This will trigger user confirmation dialog in MCP clients

```bash
curl -X POST "https://mcp-hack.onrender.com/call" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "slack_post_message",
    "arguments": {
      "channel_id": "C1234567890",
      "text": "Test message from MCP API"
    }
  }' \
  -v
```

### Test GitHub Tool (Get File Contents)
```bash
curl -X POST "https://mcp-hack.onrender.com/call" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "get_file_contents",
    "arguments": {
      "owner": "octocat",
      "repo": "Hello-World", 
      "path": "README.md"
    }
  }' \
  -v
```

### Test Error Handling (Unknown Tool)
```bash
curl -X POST "https://mcp-hack.onrender.com/call" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "nonexistent_tool",
    "arguments": {}
  }' \
  -v
```

**Expected Response**: 404 Not Found
```json
{
  "error": "Unknown tool: nonexistent_tool"
}
```

## Authentication Notes

1. **Bearer Token**: Replace `YOUR_TOKEN_HERE` with actual bearer token if authentication is implemented
2. **API Key**: Replace `YOUR_API_KEY_HERE` with actual API key if required
3. **No Auth**: If the server doesn't require authentication, remove the Authorization and x-api-key headers

## Environment Variables Required

For the server to function properly, ensure these environment variables are set:

- `SLACK_BOT_TOKEN`: Slack bot token for Slack operations
- `GITHUB_TOKEN`: GitHub personal access token for GitHub operations  
- `TEST_PORT`: Port number (default: 4000)

## Expected HTTP Status Codes

- **200**: Successful operation
- **400**: Bad request (invalid JSON, missing required fields)
- **404**: Tool not found
- **500**: Tool execution error (missing tokens, API errors)

## Rate Limiting Considerations

The server may implement rate limiting. Watch for these headers in responses:
- `RateLimit-Limit`
- `RateLimit-Remaining` 
- `RateLimit-Reset`
- `Retry-After` (in case of 429 Too Many Requests)
