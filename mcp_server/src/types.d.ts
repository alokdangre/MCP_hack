declare module "@modelcontextprotocol/sdk/server/index.js" {
    const exported: any;
    export { exported as Server };
    export default exported;
  }
  declare module "@modelcontextprotocol/sdk/server/stdio.js" {
    const exported: any;
    export { exported as StdioServerTransport };
  }
  declare module "@modelcontextprotocol/sdk/server/streamableHttp.js" {
    const exported: any;
    export { exported as StreamableHTTPServerTransport };
  }
  declare module "@modelcontextprotocol/sdk/types.js" {
    export const CallToolRequestSchema: any;
    export const ListToolsRequestSchema: any;
    export const Tool: any;
  }
  