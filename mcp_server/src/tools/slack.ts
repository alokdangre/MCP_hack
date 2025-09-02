// src/tools/slack.ts
import axios from "axios";
import { getOutboundAccessToken } from "../helpers/descope.js";

export type SlackPostInput = {
  channel: string;           // channel id or name (#channel)
  text: string;
  descope_session_id: string;
  idempotency_key?: string;
};

export async function slackPostMessage(input: SlackPostInput) {
  const { channel, text, descope_session_id, idempotency_key } = input;
  if (!channel || !text || !descope_session_id) return { status: "failed", error: "missing params" };

  const outboundAppId = process.env.DESCOPE_OUTBOUND_APP_ID_SLACK!;
  const token = await getOutboundAccessToken(outboundAppId, descope_session_id);

  try {
    const resp = await axios.post(
      "https://slack.com/api/chat.postMessage",
      { channel, text },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Idempotency-Key": idempotency_key ?? `orgmcp-slack-${Date.now()}`
        },
        timeout: 10000
      }
    );
    if (!resp.data.ok) return { status: "failed", error: resp.data };
    return { status: "success", data: resp.data };
  } catch (err: any) {
    return { status: "failed", error: String(err.response?.data ?? err.message) };
  }
}
