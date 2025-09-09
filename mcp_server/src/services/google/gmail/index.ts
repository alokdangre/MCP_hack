import { GmailClient } from './client.js';

// Gmail Tools
export const tools = [
  // Search messages
  {
    name: 'gmail_search_messages',
    description: 'Search for messages in Gmail',
    inputSchema: {
      type: 'object',
      properties: {
        user_google_email: { type: 'string' },
        query: { type: 'string' },
        max_results: { type: 'number', default: 10 }
      },
      required: ['user_google_email', 'query']
    }
  },
  // Get message content
  {
    name: 'gmail_get_message',
    description: 'Get the content of a specific message',
    inputSchema: {
      type: 'object',
      properties: {
        user_google_email: { type: 'string' },
        message_id: { type: 'string' },
        format: { 
          type: 'string', 
          enum: ['full', 'metadata', 'minimal', 'raw'],
          default: 'full'
        }
      },
      required: ['user_google_email', 'message_id']
    }
  },
  // Send message
  {
    name: 'gmail_send_message',
    description: 'Send an email message',
    inputSchema: {
      type: 'object',
      properties: {
        user_google_email: { type: 'string' },
        to: { type: 'string' },
        subject: { type: 'string' },
        body: { type: 'string' },
        cc: { type: 'string' },
        bcc: { type: 'string' },
        thread_id: { type: 'string' },
        in_reply_to: { type: 'string' },
        references: { type: 'string' }
      },
      required: ['user_google_email', 'to', 'subject', 'body']
    }
  },
  // Create draft
  {
    name: 'gmail_create_draft',
    description: 'Create a draft email message',
    inputSchema: {
      type: 'object',
      properties: {
        user_google_email: { type: 'string' },
        subject: { type: 'string' },
        body: { type: 'string' },
        to: { type: 'string' },
        cc: { type: 'string' },
        bcc: { type: 'string' },
        thread_id: { type: 'string' },
        in_reply_to: { type: 'string' },
        references: { type: 'string' }
      },
      required: ['user_google_email', 'subject', 'body']
    }
  },
  // Get thread
  {
    name: 'gmail_get_thread',
    description: 'Get a thread of messages',
    inputSchema: {
      type: 'object',
      properties: {
        user_google_email: { type: 'string' },
        thread_id: { type: 'string' }
      },
      required: ['user_google_email', 'thread_id']
    }
  },
  // List labels
  {
    name: 'gmail_list_labels',
    description: 'List all Gmail labels',
    inputSchema: {
      type: 'object',
      properties: {
        user_google_email: { type: 'string' }
      },
      required: ['user_google_email']
    }
  },
  // Manage label
  {
    name: 'gmail_manage_label',
    description: 'Create, update, or delete a Gmail label',
    inputSchema: {
      type: 'object',
      properties: {
        user_google_email: { type: 'string' },
        action: { 
          type: 'string',
          enum: ['create', 'update', 'delete']
        },
        name: { type: 'string' },
        label_id: { type: 'string' },
        label_list_visibility: { 
          type: 'string',
          enum: ['labelShow', 'labelHide']
        },
        message_list_visibility: {
          type: 'string',
          enum: ['show', 'hide']
        }
      },
      required: ['user_google_email', 'action']
    }
  }
];

// Extract tool names for easier access
export const toolNames = tools.map(tool => tool.name);

// Helper function to get Gmail client
function getClient(accessToken: string) {
  if (!accessToken) {
    throw new Error('GMAIL_ACCESS_TOKEN environment variable not set');
  }
  return new GmailClient(accessToken);
}

// Helper function to create a MIME message
function createMimeMessage({
  to,
  from,
  subject,
  body,
  cc,
  bcc,
  inReplyTo,
  references,
  threadId
}: {
  to?: string;
  from?: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  inReplyTo?: string;
  references?: string;
  threadId?: string;
}): string {
  const headers = [
    `From: ${from || 'me'}`,
    `To: ${to || ''}`,
    `Subject: ${subject}`,
  ];

  if (cc) headers.push(`Cc: ${cc}`);
  if (bcc) headers.push(`Bcc: ${bcc}`);
  if (inReplyTo) headers.push(`In-Reply-To: ${inReplyTo}`);
  if (references) headers.push(`References: ${references}`);
  if (threadId) headers.push(`Thread-Id: ${threadId}`);

  return [
    ...headers,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    '',
    body
  ].join('\r\n');
}

export async function callTool(name: string, args: any) {
  const { user_google_email, ...restArgs } = args;
  const accessToken = process.env.GOOGLE_OAUTH_ACCESS_TOKEN;
  
  if (!accessToken) {
    throw new Error('GOOGLE_OAUTH_ACCESS_TOKEN environment variable not set');
  }

  const client = getClient(accessToken);

  try {
    switch (name) {
      case 'gmail_search_messages':
        const { query, max_results = 10 } = restArgs;
        const messages = await client.searchMessages(query, max_results);
        return messages.map((msg: any) => ({
          id: msg.id,
          threadId: msg.threadId,
          snippet: msg.snippet,
          internalDate: msg.internalDate
        }));

      case 'gmail_get_message':
        const { message_id, format = 'full' } = restArgs;
        return await client.getMessage(message_id, format);

      case 'gmail_send_message':
        const sendMessage = {
          to: restArgs.to,
          subject: restArgs.subject,
          body: restArgs.body,
          cc: restArgs.cc,
          bcc: restArgs.bcc,
          inReplyTo: restArgs.in_reply_to,
          references: restArgs.references,
          threadId: restArgs.thread_id
        };
        const rawMessage = createMimeMessage(sendMessage);
        return await client.sendMessage(rawMessage, restArgs.thread_id);

      case 'gmail_create_draft':
        const draftMessage = {
          to: restArgs.to,
          subject: restArgs.subject,
          body: restArgs.body,
          cc: restArgs.cc,
          bcc: restArgs.bcc,
          inReplyTo: restArgs.in_reply_to,
          references: restArgs.references,
          threadId: restArgs.thread_id
        };
        const rawDraft = createMimeMessage(draftMessage);
        return await client.createDraft(rawDraft, restArgs.thread_id);

      case 'gmail_get_thread':
        return await client.getThread(restArgs.thread_id);

      case 'gmail_list_labels':
        const labels = await client.listLabels();
        return labels.map((label: any) => ({
          id: label.id,
          name: label.name,
          type: label.type,
          messagesTotal: label.messagesTotal,
          messagesUnread: label.messagesUnread,
          threadsTotal: label.threadsTotal,
          threadsUnread: label.threadsUnread
        }));

      case 'gmail_manage_label':
        const { action, label_id, name, label_list_visibility, message_list_visibility } = restArgs;
        
        switch (action) {
          case 'create':
            if (!name) throw new Error('Label name is required for create action');
            return await client.createLabel({
              name,
              labelListVisibility: label_list_visibility,
              messageListVisibility: message_list_visibility
            });
            
          case 'update':
            if (!label_id) throw new Error('Label ID is required for update action');
            return await client.updateLabel(label_id, {
              name,
              labelListVisibility: label_list_visibility,
              messageListVisibility: message_list_visibility
            });
            
          case 'delete':
            if (!label_id) throw new Error('Label ID is required for delete action');
            return await client.deleteLabel(label_id);
            
          default:
            throw new Error(`Invalid action: ${action}`);
        }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    console.error(`Error in ${name}:`, error);
    throw new Error(`Gmail API error: ${error.message}`);
  }
}
