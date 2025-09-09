import { google, sheets_v4, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export class GoogleSheetsClient {
  private oauth2Client: OAuth2Client;
  private sheets: sheets_v4.Sheets;
  private drive: drive_v3.Drive;

  constructor(accessToken: string) {
    this.oauth2Client = new google.auth.OAuth2();
    this.oauth2Client.setCredentials({ access_token: accessToken });
    this.sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });
    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
  }

  async listSpreadsheets(maxResults: number = 25) {
    const res = await this.drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      pageSize: maxResults,
      fields: 'files(id, name, modifiedTime, webViewLink)',
      orderBy: 'modifiedTime desc',
    });
    return res.data.files || [];
  }

  async getSpreadsheet(spreadsheetId: string) {
    const res = await this.sheets.spreadsheets.get({
      spreadsheetId,
    });
    return res.data;
  }

  async getValues(spreadsheetId: string, range: string) {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    return res.data;
  }

  async updateValues(
    spreadsheetId: string,
    range: string,
    values: any[][],
    valueInputOption: 'RAW' | 'USER_ENTERED' = 'USER_ENTERED'
  ) {
    const res = await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption,
      requestBody: {
        values,
      },
    });
    return res.data;
  }

  async clearValues(spreadsheetId: string, range: string) {
    const res = await this.sheets.spreadsheets.values.clear({
      spreadsheetId,
      range,
    });
    return res.data;
  }

  async createSpreadsheet(title: string, sheetNames: string[] = []) {
    const spreadsheet = {
      properties: {
        title,
      },
      sheets: sheetNames.map(name => ({
        properties: {
          title: name,
        },
      })),
    };

    const res = await this.sheets.spreadsheets.create({
      requestBody: spreadsheet,
    });

    return res.data;
  }

  async addSheet(spreadsheetId: string, title: string) {
    const request = {
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title,
              },
            },
          },
        ],
      },
    };

    const res = await this.sheets.spreadsheets.batchUpdate(request);
    return res.data;
  }

  // Comment-related methods can be added here when needed
  // async listComments(spreadsheetId: string) { ... }
  // async createComment(spreadsheetId: string, comment: any) { ... }
  // etc.
}
