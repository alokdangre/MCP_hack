import { SlackClient } from './client.js';

export const tools = [
  {
    name: 'slack_list_channels',
    description: 'List public or pre-defined channels in the workspace with pagination',
    inputSchema: { type: 'object', properties: { limit: { type: 'number', default: 100 }, cursor: { type: 'string' } } },
  },
  {
    name: 'slack_post_message',
    description: 'Post a new message to a Slack channel',
    inputSchema: { type: 'object', properties: { channel_id: { type: 'string' }, text: { type: 'string' } }, required: ['channel_id', 'text'] },
  },
  {
    name: 'slack_reply_to_thread',
    description: 'Reply to a specific message thread in Slack',
    inputSchema: { type: 'object', properties: { channel_id: { type: 'string' }, thread_ts: { type: 'string' }, text: { type: 'string' } }, required: ['channel_id', 'thread_ts', 'text'] },
  },
  {
    name: 'slack_add_reaction',
    description: 'Add a reaction emoji to a message',
    inputSchema: { type: 'object', properties: { channel_id: { type: 'string' }, timestamp: { type: 'string' }, reaction: { type: 'string' } }, required: ['channel_id', 'timestamp', 'reaction'] },
  },
  {
    name: 'slack_get_channel_history',
    description: 'Get recent messages from a channel',
    inputSchema: { type: 'object', properties: { channel_id: { type: 'string' }, limit: { type: 'number', default: 10 } }, required: ['channel_id'] },
  },
  {
    name: 'slack_get_thread_replies',
    description: 'Get all replies in a message thread',
    inputSchema: { type: 'object', properties: { channel_id: { type: 'string' }, thread_ts: { type: 'string' } }, required: ['channel_id','thread_ts'] },
  },
  {
    name: 'slack_get_users',
    description: 'Get a list of all users in the workspace with basic profile information',
    inputSchema: { type: 'object', properties: { cursor: { type: 'string' }, limit: { type: 'number', default: 100 } } },
  },
  {
    name: 'slack_get_user_profile',
    description: 'Get detailed profile information for a specific user',
    inputSchema: { type: 'object', properties: { user_id: { type: 'string' } }, required: ['user_id'] },
  },
];

function getClient() {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) throw new Error('SLACK_BOT_TOKEN not set');
  return new SlackClient(token);
}

export async function callTool(name: string, args: any) {
  const client = getClient();
  switch (name) {
    case 'slack_list_channels':
      return client.getChannels(args.limit, args.cursor);
    case 'slack_post_message':
      if (!args.channel_id || !args.text) throw new Error('Missing channel_id or text');
      return client.postMessage(args.channel_id, args.text);
    case 'slack_reply_to_thread':
      if (!args.channel_id || !args.thread_ts || !args.text) throw new Error('Missing args');
      return client.postReply(args.channel_id, args.thread_ts, args.text);
    case 'slack_add_reaction':
      if (!args.channel_id || !args.timestamp || !args.reaction) throw new Error('Missing args');
      return client.addReaction(args.channel_id, args.timestamp, args.reaction);
    case 'slack_get_channel_history':
      if (!args.channel_id) throw new Error('Missing channel_id');
      return client.getChannelHistory(args.channel_id, args.limit);
    case 'slack_get_thread_replies':
      if (!args.channel_id || !args.thread_ts) throw new Error('Missing args');
      return client.getThreadReplies(args.channel_id, args.thread_ts);
    case 'slack_get_users':
      return client.getUsers(args.limit, args.cursor);
    case 'slack_get_user_profile':
      if (!args.user_id) throw new Error('Missing user_id');
      return client.getUserProfile(args.user_id);
    default:
      throw new Error(`Slack unknown tool: ${name}`);
  }
}
