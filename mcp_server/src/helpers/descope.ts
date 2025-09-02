import JwksRsa from "jwks-rsa";
import jwt from "jsonwebtoken";
import axios from "axios";

const jwksUri = process.env.DESCOPE_JWKS_URL!;
const projectId = process.env.DESCOPE_PROJECT_ID!;
const managementKey = process.env.DESCOPE_MANAGEMENT_KEY!;
const apiBase = process.env.DESCOPE_API_BASE!;

const jwksClient = JwksRsa({
  jwksUri,
  cache: true,
  cacheMaxEntries: 5,
  timeout: 30000,
});

export async function verifyDescopeInboundJwt(token: string) {
  if (!token) throw new Error("missing token");
  const decoded = jwt.decode(token, { complete: true }) as any;
  if (!decoded || !decoded.header || !decoded.header.kid) {
    throw new Error("invalid token shape");
  }

  const kid = decoded.header.kid;
  const key = await jwksClient.getSigningKey(kid);
  const pub = key.getPublicKey();

  return jwt.verify(token, pub, { algorithms: ["RS256"] }) as any;
}

/**
 * Request an access token for a provider via Descope Outbound App.
 * sessionId: the Descope session id returned when user completed the flow.
 * outboundAppId: the configured Descope Outbound App ID for the provider.
 *
 * NOTE: Replace the URL/shape according to your Descope Outbound API. The call
 * below is a common pattern: server-side POST to Descope to exchange session -> access token.
 */

export async function getOutboundAccessToken(outboundAppId: string, sessionId: string) {
    if(!managementKey) throw new Error("missing management key");
    if(!outboundAppId) throw new Error("missing outboundAppId");
    if(!sessionId) throw new Error("missing sessionId");

    // Example endpoint - replace with your Descope API path if different
    const url = `${apiBase}/v1/outbound/${outboundAppId}/token`;
    const resp = await axios.post(
        url,
        {sessionId},
        {headers: { "x-project-id": projectId, "Authorization": `Bearer ${managementKey}` }, timeout: 15000 }
    );

    if(!resp.data || !resp.data.accessToken) throw new Error("no access token from Descope");
    return resp.data.accessToken as string;
}