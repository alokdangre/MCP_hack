# Gmail Service

This service provides MCP tools for interacting with Gmail API.

## Setup

1. Enable Gmail API in Google Cloud Console
2. Configure OAuth 2.0 credentials
3. Set the `GOOGLE_OAUTH_ACCESS_TOKEN` environment variable

## Available Tools

### Search Messages
- **Name**: `gmail_search_messages`
- **Description**: Search for messages in Gmail
- **Parameters**:
  - `user_google_email`: User's Google email
  - `query`: Gmail search query
  - `max_results`: Maximum number of results (default: 10)

### Get Message
- **Name**: `gmail_get_message`
- **Description**: Get the content of a specific message
- **Parameters**:
  - `user_google_email`: User's Google email
  - `message_id`: ID of the message to retrieve
  - `format`: Response format (full, metadata, minimal, raw, default: full)

### Send Message
- **Name**: `gmail_send_message`
- **Description**: Send an email message
- **Parameters**:
  - `user_google_email`: User's Google email
  - `to`: Recipient email address
  - `subject`: Email subject
  - `body`: Email body
  - `cc`: CC recipient (optional)
  - `bcc`: BCC recipient (optional)
  - `thread_id`: Thread ID for replies (optional)
  - `in_reply_to`: Message ID this is a reply to (optional)
  - `references`: Reference message IDs (optional)

### Create Draft
- **Name**: `gmail_create_draft`
- **Description**: Create a draft email message
- **Parameters**: Same as send message

### Get Thread
- **Name**: `gmail_get_thread`
- **Description**: Get a thread of messages
- **Parameters**:
  - `user_google_email`: User's Google email
  - `thread_id`: ID of the thread to retrieve

### List Labels
- **Name**: `gmail_list_labels`
- **Description**: List all Gmail labels
- **Parameters**:
  - `user_google_email`: User's Google email

### Manage Label
- **Name**: `gmail_manage_label`
- **Description**: Create, update, or delete a Gmail label
- **Parameters**:
  - `user_google_email`: User's Google email
  - `action`: Action to perform (create, update, delete)
  - `name`: Label name (required for create/update)
  - `label_id`: Label ID (required for update/delete)
  - `label_list_visibility`: Label visibility in list (labelShow, labelHide)
  - `message_list_visibility`: Message visibility in list (show, hide)

## Error Handling

All tools throw errors with descriptive messages. Common error cases include:
- Missing required parameters
- Invalid email addresses
- Permission denied
- Resource not found
- Rate limiting

## Security

- Requires valid OAuth 2.0 access token with appropriate scopes
- Never logs or stores message content
- Validates all input parameters
- Implements proper error handling and sanitization
