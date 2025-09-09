import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export class GmailClient {
  private oauth2Client: OAuth2Client;
  private gmail: any;

  constructor(accessToken: string) {
    this.oauth2Client = new google.auth.OAuth2();
    this.oauth2Client.setCredentials({ access_token: accessToken });
    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  async listLabels() {
    const res = await this.gmail.users.labels.list({
      userId: 'me',
    });
    return res.data.labels || [];
  }

  async searchMessages(query: string, maxResults: number = 10) {
    const res = await this.gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults,
    });
    return res.data.messages || [];
  }

  async getMessage(messageId: string, format: 'full' | 'metadata' | 'minimal' | 'raw' = 'full') {
    const res = await this.gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format,
    });
    return res.data;
  }

  async getMessageBatch(messageIds: string[], format: 'full' | 'metadata' | 'minimal' | 'raw' = 'full') {
    const batch = this.gmail.newBatchRequest();
    const results: Record<string, any> = {};

    messageIds.forEach((id) => {
      batch.add(
        this.gmail.users.messages.get({
          userId: 'me',
          id,
          format,
        }),
        { id, callback: (err: any, res: any) => {
          if (err) {
            results[id] = { error: err };
          } else {
            results[id] = { data: res.data };
          }
        }}
      );
    });

    await batch.execute();
    return results;
  }

  async sendMessage(rawMessage: string, threadId?: string) {
    const message = {
      raw: Buffer.from(rawMessage).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
      threadId,
    };

    const res = await this.gmail.users.messages.send({
      userId: 'me',
      requestBody: message,
    });

    return res.data;
  }

  async createDraft(rawMessage: string, threadId?: string) {
    const message = {
      raw: Buffer.from(rawMessage).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
      threadId,
    };

    const res = await this.gmail.users.drafts.create({
      userId: 'me',
      requestBody: {
        message,
      },
    });

    return res.data;
  }

  async getThread(threadId: string) {
    const res = await this.gmail.users.threads.get({
      userId: 'me',
      id: threadId,
      format: 'full',
    });
    return res.data;
  }

  async getThreadsBatch(threadIds: string[]) {
    const batch = this.gmail.newBatchRequest();
    const results: Record<string, any> = {};

    threadIds.forEach((id) => {
      batch.add(
        this.gmail.users.threads.get({
          userId: 'me',
          id,
          format: 'full',
        }),
        { id, callback: (err: any, res: any) => {
          if (err) {
            results[id] = { error: err };
          } else {
            results[id] = { data: res.data };
          }
        }}
      );
    });

    await batch.execute();
    return results;
  }

  async createLabel(labelData: { name: string; labelListVisibility?: string; messageListVisibility?: string }) {
    const res = await this.gmail.users.labels.create({
      userId: 'me',
      requestBody: labelData,
    });
    return res.data;
  }

  async updateLabel(labelId: string, labelData: { name?: string; labelListVisibility?: string; messageListVisibility?: string }) {
    const res = await this.gmail.users.labels.patch({
      userId: 'me',
      id: labelId,
      requestBody: labelData,
    });
    return res.data;
  }

  async deleteLabel(labelId: string) {
    await this.gmail.users.labels.delete({
      userId: 'me',
      id: labelId,
    });
    return { success: true };
  }
}
