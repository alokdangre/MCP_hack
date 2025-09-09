import * as calendarModule from './calendar/index.js';
import * as gmailModule from './gmail/index.js';
import * as sheetsModule from './sheets/index.js';

export const tools = [
  ...calendarModule.tools,
  ...gmailModule.tools,
  ...sheetsModule.tools,
];

export const toolNames = [
  ...calendarModule.toolNames,
  ...gmailModule.toolNames,
  ...sheetsModule.toolNames,
];

export async function callTool(name: string, args: any) {
  if (name.startsWith('google_calendar_')) {
    return calendarModule.callTool(name, args);
  }
  if (name.startsWith('gmail_')) {
    return gmailModule.callTool(name, args);
  }
  if (name.startsWith('google_sheets_')) {
    return sheetsModule.callTool(name, args);
  }
  throw new Error(`Unknown tool: ${name}`);
}
