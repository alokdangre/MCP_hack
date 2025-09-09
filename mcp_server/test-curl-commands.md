# Test Curl Commands for MCP Gateway API

## API Information
```bash
curl -X GET "https://mcp-hack.onrender.com/" \
  -H "Accept: text/plain"
```

## List Available Tools
```bash
curl -X GET "https://mcp-hack.onrender.com/tools" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Slack Operations

### List Slack Channels
```bash
curl -X POST "https://mcp-hack.onrender.com/slack/list-channels" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "limit": 50,
    "cursor": ""
  }'
```

### Post Message to Slack
```bash
curl -X POST "https://mcp-hack.onrender.com/slack/post-message" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "channel_id": "C1234567890",
    "text": "Hello from MCP API!"
  }'
```

## GitHub Operations

### Create GitHub Repository
```bash
curl -X POST "https://mcp-hack.onrender.com/github/create-repository" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "my-new-repo",
    "description": "A repository created via MCP API",
    "private": false,
    "auto_init": true
  }'
```

## Google Sheets Operations

### List Google Sheets
```bash
curl -X POST "https://mcp-hack.onrender.com/google/sheets/list" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_GOOGLE_ACCESS_TOKEN" \
  -d '{
    "max_results": 10
  }'
```

### Read Google Sheet Values
```bash
curl -X POST "https://mcp-hack.onrender.com/google/sheets/read" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_GOOGLE_ACCESS_TOKEN" \
  -d '{
    "spreadsheet_id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "range": "Sheet1!A1:E10"
  }'
```

### Modify Google Sheet Values
```bash
curl -X POST "https://mcp-hack.onrender.com/google/sheets/modify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_GOOGLE_ACCESS_TOKEN" \
  -d '{
    "spreadsheet_id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "range": "Sheet1!A1:B2",
    "values": [
      ["Name", "Age"],
      ["John Doe", "30"]
    ]
  }'
```

## Google Calendar Operations

### List Google Calendars
```bash
curl -X POST "https://mcp-hack.onrender.com/google/calendar/list-calendars" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_GOOGLE_ACCESS_TOKEN" \
  -d '{}'
```

## Gmail Operations

### Search Gmail Messages
```bash
curl -X POST "https://mcp-hack.onrender.com/gmail/search-messages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_GOOGLE_ACCESS_TOKEN" \
  -d '{
    "user_google_email": "user@example.com",
    "query": "from:sender@example.com",
    "max_results": 10
  }'
```

## Generic Tool Call

### Execute Any Tool via Generic Endpoint
```bash
curl -X POST "https://mcp-hack.onrender.com/call" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "slack_post_message",
    "arguments": {
      "channel_id": "C1234567890",
      "text": "Hello from generic endpoint!"
    }
  }'
```

## Notes

1. Replace `YOUR_ACCESS_TOKEN` with your actual API access token
2. Replace `YOUR_GOOGLE_ACCESS_TOKEN` with your Google OAuth2 access token
3. Replace placeholder IDs and values with actual ones from your environment
4. The server supports elicitation for certain operations that may require user confirmation
5. All POST endpoints expect JSON payloads with the specified structure
6. Error responses follow the standard format defined in the OpenAPI specification
