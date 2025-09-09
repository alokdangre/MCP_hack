import * as calendarModule from './calendar/index.js';
import * as gmailModule from './gmail/index.js';

export const tools = [
  ...calendarModule.tools,
  ...gmailModule.tools,
];

export const toolNames = [
  ...calendarModule.toolNames,
  ...gmailModule.toolNames,
];

export async function callTool(name: string, args: any) {
  if (name.startsWith('google_calendar_')) {
    return calendarModule.callTool(name, args);
  }
  if (name.startsWith('gmail_')) {
    return gmailModule.callTool(name, args);
  }
  throw new Error(`Unknown tool: ${name}`);
}
