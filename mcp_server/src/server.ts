import express, { Request, Response } from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

const app = express();
app.use(express.json());

// CORS: expose the Mcp-Session-Id header to browsers
app.use(cors({
  origin: "*", // lock down in prod
  exposedHeaders: ["Mcp-Session-Id"],
  allowedHeaders: ["Content-Type", "Mcp-Session-Id", "mcp-session-id"],
}));

// Create MCP server and register tools/resources/prompts
const mcp = new McpServer({ name: "my-mcp-server", version: "1.0.0" });

// Keep track of transports per session id
const transports: Record<string, StreamableHTTPServerTransport> = {};

// Main MCP endpoint — handles POST, GET, DELETE, etc. per Streamable HTTP spec
app.all("/mcp", async (req: Request, res: Response) => {
  try {
    // If this is an initialization request, create a transport with session management
    // The SDK exposes helpers like isInitializeRequest but we can use header logic:
    const maybeSessionId = (req.headers["mcp-session-id"] || req.headers["Mcp-Session-Id"]) as string | undefined;

    // If no session id, this may be an initialization (the SDK can also detect init internally).
    // Create a new transport instance per session and store it.
    const transport = new StreamableHTTPServerTransport({
      // sessionIdGenerator ensures server-side session ids (security + resume)
      sessionIdGenerator: () => randomUUID(),
      // Enable DNS rebinding protection for public-facing servers (see notes)
      enableDnsRebindingProtection: true,
      allowedHosts: ["127.0.0.1", "localhost"],
      // allow origins you expect in production
      allowedOrigins: ["https://yourdomain.com"],
    });

    // wire up close handling to remove the transport when done
    transport.onclose = () => {
      if (transport.sessionId) delete transports[transport.sessionId];
    };

    // Register this transport for the session so future requests (with Mcp-Session-Id) can find it
    if (transport.sessionId) transports[transport.sessionId] = transport;

    // Connect the McpServer (registers tools/resources with this transport)
    await mcp.connect(transport);

    // The SDK transport expects to be handed the express request/response (and body for POST)
    // Note: the example shows `await transport.handleRequest(req, res, req.body)`
    await transport.handleRequest(req, res, req.body);
    // transport will stream and finish the response as needed (streamable or batch)
  } catch (err) {
    console.error("MCP handler error:", err);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: String(err) },
        id: null,
      });
    }
  }
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => console.log(`MCP Streamable HTTP server listening on ${PORT}`));
