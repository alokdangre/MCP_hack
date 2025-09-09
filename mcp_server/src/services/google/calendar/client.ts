import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export class GoogleCalendarClient {
  private oauth2Client: OAuth2Client;
  private calendar: any;

  constructor(accessToken: string) {
    this.oauth2Client = new google.auth.OAuth2();
    this.oauth2Client.setCredentials({ access_token: accessToken });
    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  async listCalendars() {
    const res = await this.calendar.calendarList.list();
    return res.data.items || [];
  }

  async getEvents(calendarId: string, params: any) {
    const res = await this.calendar.events.list({
      calendarId,
      ...params,
      singleEvents: true,
      orderBy: 'startTime',
    });
    return res.data.items || [];
  }

  async getEvent(calendarId: string, eventId: string) {
    const res = await this.calendar.events.get({
      calendarId,
      eventId,
    });
    return res.data;
  }

  async createEvent(calendarId: string, event: any) {
    const res = await this.calendar.events.insert({
      calendarId,
      requestBody: event,
      conferenceDataVersion: event.conferenceData ? 1 : 0,
    });
    return res.data;
  }

  async updateEvent(calendarId: string, eventId: string, event: any) {
    const res = await this.calendar.events.update({
      calendarId,
      eventId,
      requestBody: event,
      conferenceDataVersion: event.conferenceData ? 1 : 0,
    });
    return res.data;
  }

  async deleteEvent(calendarId: string, eventId: string) {
    await this.calendar.events.delete({
      calendarId,
      eventId,
    });
    return { success: true };
  }
}
