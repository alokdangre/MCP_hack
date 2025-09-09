import { GoogleSheetsClient } from './client.js';

// Google Sheets Tools
export const tools = [
  // List spreadsheets
  {
    name: 'google_sheets_list',
    description: 'Lists spreadsheets from Google Drive that the user has access to',
    inputSchema: {
      type: 'object',
      properties: {
        user_google_email: { type: 'string' },
        max_results: { type: 'number', default: 25 }
      },
      required: ['user_google_email']
    }
  },
  // Get spreadsheet info
  {
    name: 'google_sheets_get_info',
    description: 'Gets information about a specific spreadsheet including its sheets',
    inputSchema: {
      type: 'object',
      properties: {
        user_google_email: { type: 'string' },
        spreadsheet_id: { type: 'string' }
      },
      required: ['user_google_email', 'spreadsheet_id']
    }
  },
  // Read values
  {
    name: 'google_sheets_read',
    description: 'Reads values from a specific range in a Google Sheet',
    inputSchema: {
      type: 'object',
      properties: {
        user_google_email: { type: 'string' },
        spreadsheet_id: { type: 'string' },
        range: { type: 'string', default: 'A1:Z1000' }
      },
      required: ['user_google_email', 'spreadsheet_id']
    }
  },
  // Modify values
  {
    name: 'google_sheets_modify',
    description: 'Modifies values in a specific range of a Google Sheet',
    inputSchema: {
      type: 'object',
      properties: {
        user_google_email: { type: 'string' },
        spreadsheet_id: { type: 'string' },
        range: { type: 'string' },
        values: { type: 'array', items: { type: 'array' } },
        value_input_option: { 
          type: 'string',
          enum: ['RAW', 'USER_ENTERED'],
          default: 'USER_ENTERED'
        },
        clear_values: { type: 'boolean', default: false }
      },
      required: ['user_google_email', 'spreadsheet_id', 'range']
    }
  },
  // Create spreadsheet
  {
    name: 'google_sheets_create',
    description: 'Creates a new Google Spreadsheet',
    inputSchema: {
      type: 'object',
      properties: {
        user_google_email: { type: 'string' },
        title: { type: 'string' },
        sheet_names: { 
          type: 'array',
          items: { type: 'string' },
          default: []
        }
      },
      required: ['user_google_email', 'title']
    }
  },
  // Add sheet
  {
    name: 'google_sheets_add_sheet',
    description: 'Creates a new sheet within an existing spreadsheet',
    inputSchema: {
      type: 'object',
      properties: {
        user_google_email: { type: 'string' },
        spreadsheet_id: { type: 'string' },
        sheet_name: { type: 'string' }
      },
      required: ['user_google_email', 'spreadsheet_id', 'sheet_name']
    }
  }
];

// Extract tool names for easier access
export const toolNames = tools.map(tool => tool.name);

// Helper function to get Google Sheets client
function getClient(accessToken: string) {
  if (!accessToken) {
    throw new Error('GOOGLE_OAUTH_ACCESS_TOKEN environment variable not set');
  }
  return new GoogleSheetsClient(accessToken);
}

export async function callTool(name: string, args: any) {
  const { user_google_email, ...restArgs } = args;
  const accessToken = process.env.GOOGLE_OAUTH_ACCESS_TOKEN;
  
  if (!accessToken) {
    throw new Error('GOOGLE_OAUTH_ACCESS_TOKEN environment variable not set');
  }

  const client = getClient(accessToken);

  try {
    switch (name) {
      case 'google_sheets_list': {
        const { max_results = 25 } = restArgs;
        const files = await client.listSpreadsheets(max_results);
        
        return files.map((file: any) => ({
          id: file.id,
          name: file.name,
          modifiedTime: file.modifiedTime,
          webViewLink: file.webViewLink
        }));
      }

      case 'google_sheets_get_info': {
        const { spreadsheet_id } = restArgs;
        const spreadsheet = await client.getSpreadsheet(spreadsheet_id);
        
        const sheets = (spreadsheet.sheets || []).map((sheet: any) => ({
          id: sheet.properties.sheetId,
          title: sheet.properties.title,
          rowCount: sheet.properties.gridProperties?.rowCount,
          columnCount: sheet.properties.gridProperties?.columnCount,
          sheetType: sheet.properties.sheetType
        }));

        return {
          spreadsheetId: spreadsheet.spreadsheetId,
          title: spreadsheet.properties?.title,
          locale: spreadsheet.properties?.locale,
          timeZone: spreadsheet.properties?.timeZone,
          sheets,
          spreadsheetUrl: spreadsheet.spreadsheetUrl
        };
      }

      case 'google_sheets_read': {
        const { spreadsheet_id, range = 'A1:Z1000' } = restArgs;
        const result = await client.getValues(spreadsheet_id, range);
        
        return {
          range: result.range,
          values: result.values || [],
          majorDimension: result.majorDimension || 'ROWS'
        };
      }

      case 'google_sheets_modify': {
        const { 
          spreadsheet_id, 
          range, 
          values, 
          value_input_option = 'USER_ENTERED',
          clear_values = false
        } = restArgs;

        if (clear_values) {
          const result = await client.clearValues(spreadsheet_id, range);
          return {
            operation: 'clear',
            clearedRange: result.clearedRange,
            spreadsheetId: spreadsheet_id
          };
        } else {
          if (!values) {
            throw new Error('Values are required when clear_values is false');
          }
          
          const result = await client.updateValues(
            spreadsheet_id,
            range,
            values,
            value_input_option
          );

          return {
            operation: 'update',
            updatedRange: result.updatedRange,
            updatedRows: result.updatedRows,
            updatedColumns: result.updatedColumns,
            updatedCells: result.updatedCells,
            spreadsheetId: spreadsheet_id
          };
        }
      }

      case 'google_sheets_create': {
        const { title, sheet_names = [] } = restArgs;
        const spreadsheet = await client.createSpreadsheet(title, sheet_names);
        
        return {
          spreadsheetId: spreadsheet.spreadsheetId,
          title: spreadsheet.properties?.title,
          spreadsheetUrl: spreadsheet.spreadsheetUrl,
          sheets: (spreadsheet.sheets || []).map((sheet: any) => ({
            id: sheet.properties.sheetId,
            title: sheet.properties.title
          }))
        };
      }

      case 'google_sheets_add_sheet': {
        const { spreadsheet_id, sheet_name } = restArgs;
        const response = await client.addSheet(spreadsheet_id, sheet_name);
        
        const sheet = response.replies?.[0]?.addSheet?.properties;
        if (!sheet) {
          throw new Error('Failed to add sheet');
        }

        return {
          spreadsheetId: spreadsheet_id,
          sheetId: sheet.sheetId,
          title: sheet.title,
          rowCount: sheet.gridProperties?.rowCount,
          columnCount: sheet.gridProperties?.columnCount
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    console.error(`Error in ${name}:`, error);
    throw new Error(`Google Sheets API error: ${error.message}`);
  }
}
