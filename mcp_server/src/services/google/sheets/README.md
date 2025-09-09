# Google Sheets Service

This service provides MCP tools for interacting with Google Sheets API.

## Setup

1. Enable Google Sheets API in Google Cloud Console
2. Configure OAuth 2.0 credentials with the following scopes:
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/drive.readonly`
3. Set the `GOOGLE_OAUTH_ACCESS_TOKEN` environment variable

## Available Tools

### List Spreadsheets
- **Name**: `google_sheets_list`
- **Description**: Lists spreadsheets from Google Drive that the user has access to
- **Parameters**:
  - `user_google_email`: User's Google email
  - `max_results`: Maximum number of results (default: 25)

### Get Spreadsheet Info
- **Name**: `google_sheets_get_info`
- **Description**: Gets information about a specific spreadsheet including its sheets
- **Parameters**:
  - `user_google_email`: User's Google email
  - `spreadsheet_id`: ID of the spreadsheet

### Read Values
- **Name**: `google_sheets_read`
- **Description**: Reads values from a specific range in a Google Sheet
- **Parameters**:
  - `user_google_email`: User's Google email
  - `spreadsheet_id`: ID of the spreadsheet
  - `range`: Range to read (e.g., "A1:B2", "Sheet1!A1:Z1000") (default: "A1:Z1000")

### Modify Values
- **Name**: `google_sheets_modify`
- **Description**: Modifies values in a specific range of a Google Sheet
- **Parameters**:
  - `user_google_email`: User's Google email
  - `spreadsheet_id`: ID of the spreadsheet
  - `range`: Range to modify (e.g., "A1:B2", "Sheet1!A1")
  - `values`: 2D array of values to write
  - `value_input_option`: How to interpret input values ("RAW" or "USER_ENTERED", default: "USER_ENTERED")
  - `clear_values`: If true, clears the range instead of writing values (default: false)

### Create Spreadsheet
- **Name**: `google_sheets_create`
- **Description**: Creates a new Google Spreadsheet
- **Parameters**:
  - `user_google_email`: User's Google email
  - `title`: Title of the new spreadsheet
  - `sheet_names`: Array of sheet names to create (default: [])

### Add Sheet
- **Name**: `google_sheets_add_sheet`
- **Description**: Creates a new sheet within an existing spreadsheet
- **Parameters**:
  - `user_google_email`: User's Google email
  - `spreadsheet_id`: ID of the spreadsheet
  - `sheet_name`: Name of the new sheet

## Error Handling

All tools throw errors with descriptive messages. Common error cases include:
- Missing required parameters
- Invalid spreadsheet ID or range
- Permission denied
- Rate limiting

## Security

- Requires valid OAuth 2.0 access token with appropriate scopes
- Validates all input parameters
- Implements proper error handling and sanitization

## Examples

### List spreadsheets
```json
{
  "user_google_email": "user@example.com",
  "max_results": 5
}
```

### Read values
```json
{
  "user_google_email": "user@example.com",
  "spreadsheet_id": "1A2B3C4D...",
  "range": "Sheet1!A1:C10"
}
```

### Update values
```json
{
  "user_google_email": "user@example.com",
  "spreadsheet_id": "1A2B3C4D...",
  "range": "Sheet1!A1",
  "values": [["Name", "Email"], ["John", "john@example.com"]]
}
```

### Create spreadsheet
```json
{
  "user_google_email": "user@example.com",
  "title": "My New Spreadsheet",
  "sheet_names": ["Sheet1", "Data"]
}
```
