import axios from "axios";
import { getOutboundAccessToken } from "../helpers/descope.js";

export type GithubAssignInput = {
  repo: string;
  issue_number: number;
  assignee: string;
  descope_session_id: string;
  idempotency_key?: string;
};

export async function githubAssignIssue(input: GithubAssignInput) {
  const { repo, issue_number, assignee, descope_session_id, idempotency_key } =
    input;

  if (!repo || !issue_number || !assignee || !descope_session_id) {
    return { status: "failed", error: "missing params" };
  }

  const outboundAppId = process.env.DESCOPE_OUTBOUND_APP_ID_GITHUB!;
  const token = await getOutboundAccessToken(outboundAppId, descope_session_id);

  const url = `https://api.github.com/repos/${repo}/issues/${issue_number}/assignees`;

  try {
    const resp = await axios.post(
      url,
      { assignees: [assignee] },
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "OrgMCP",
          "Idempotency-Key":
            idempotency_key ?? `orgmcp-gh-${repo}-${issue_number}-${assignee}`,
        },
        timeout: 15000,
      }
    );
    return { status: "success", data: resp.data };
  } catch (err: any) {
    const body = err.response?.data ?? err.message;
    return { status: "failed", error: String(body) };
  }
}
