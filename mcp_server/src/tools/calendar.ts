// src/tools/calendar.ts
import axios from "axios";
import { getOutboundAccessToken } from "../helpers/descope";

export type CalendarCreateInput = {
  calendarId?: string; // default "primary"
  summary: string;
  start: string; // "2025-09-02T16:00:00+05:30"
  end: string;
  attendees?: string[]; // emails
  descope_session_id: string;
  idempotency_key?: string;
};

export async function calendarCreateEvent(input: CalendarCreateInput) {
  const { calendarId = "primary", summary, start, end, attendees = [], descope_session_id, idempotency_key } = input;
  if (!summary || !start || !end || !descope_session_id) return { status: "failed", error: "missing params" };

  const outboundAppId = process.env.DESCOPE_OUTBOUND_APP_ID_GOOGLE!;
  const token = await getOutboundAccessToken(outboundAppId, descope_session_id);

  const event = {
    summary,
    start: { dateTime: start },
    end: { dateTime: end },
    attendees: attendees.map(e => ({ email: e })),
    conferenceData: { createRequest: { requestId: idempotency_key ?? `orgmcp-${Date.now()}` } }
  };

  try {
    const resp = await axios.post(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1`,
      event,
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, timeout: 15000 }
    );
    return { status: "success", data: resp.data };
  } catch (err: any) {
    return { status: "failed", error: String(err.response?.data ?? err.message) };
  }
}
