export class SlackClient {
    private botHeaders: Record<string, string>;
  
    constructor(botToken: string) {
      this.botHeaders = {
        Authorization: `Bearer ${botToken}`,
        'Content-Type': 'application/json',
      };
    }
  
    async getChannels(limit = 100, cursor?: string): Promise<any> {
      const predefinedChannelIds = process.env.SLACK_CHANNEL_IDS;
      if (!predefinedChannelIds) {
        const params = new URLSearchParams({
          types: 'public_channel',
          exclude_archived: 'true',
          limit: Math.min(limit, 200).toString(),
          team_id: process.env.SLACK_TEAM_ID ?? '',
        });
        if (cursor) params.append('cursor', cursor);
        const res = await fetch(`https://slack.com/api/conversations.list?${params}`, { headers: this.botHeaders });
        return res.json();
      }
  
      const ids = predefinedChannelIds.split(',').map((s) => s.trim());
      const channels: any[] = [];
      for (const id of ids) {
        const params = new URLSearchParams({ channel: id });
        const res = await fetch(`https://slack.com/api/conversations.info?${params}`, { headers: this.botHeaders });
        const data = await res.json();
        if (data.ok && data.channel && !data.channel.is_archived) channels.push(data.channel);
      }
      return { ok: true, channels, response_metadata: { next_cursor: '' } };
    }
  
    async postMessage(channel_id: string, text: string): Promise<any> {
      const res = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: this.botHeaders,
        body: JSON.stringify({ channel: channel_id, text }),
      });
      return res.json();
    }
  
    async postReply(channel_id: string, thread_ts: string, text: string): Promise<any> {
      const res = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: this.botHeaders,
        body: JSON.stringify({ channel: channel_id, thread_ts, text }),
      });
      return res.json();
    }
  
    async addReaction(channel_id: string, timestamp: string, reaction: string): Promise<any> {
      const res = await fetch('https://slack.com/api/reactions.add', {
        method: 'POST',
        headers: this.botHeaders,
        body: JSON.stringify({ channel: channel_id, timestamp, name: reaction }),
      });
      return res.json();
    }
  
    async getChannelHistory(channel_id: string, limit = 10): Promise<any> {
      const params = new URLSearchParams({ channel: channel_id, limit: limit.toString() });
      const res = await fetch(`https://slack.com/api/conversations.history?${params}`, { headers: this.botHeaders });
      return res.json();
    }
  
    async getThreadReplies(channel_id: string, thread_ts: string): Promise<any> {
      const params = new URLSearchParams({ channel: channel_id, ts: thread_ts });
      const res = await fetch(`https://slack.com/api/conversations.replies?${params}`, { headers: this.botHeaders });
      return res.json();
    }
  
    async getUsers(limit = 100, cursor?: string): Promise<any> {
      const params = new URLSearchParams({ limit: Math.min(limit, 200).toString(), team_id: process.env.SLACK_TEAM_ID ?? '' });
      if (cursor) params.append('cursor', cursor);
      const res = await fetch(`https://slack.com/api/users.list?${params}`, { headers: this.botHeaders });
      return res.json();
    }
  
    async getUserProfile(user_id: string): Promise<any> {
      const params = new URLSearchParams({ user: user_id, include_labels: 'true' });
      const res = await fetch(`https://slack.com/api/users.profile.get?${params}`, { headers: this.botHeaders });
      return res.json();
    }

    async postMessageWithElicitation(channel_id: string, text: string, server?: any): Promise<any> {
      if (!server) {
        // Fallback to direct posting if no server provided
        return this.postMessage(channel_id, text);
      }
      let elicitationResponse;
      try {
        // Send elicitation request to client using the server's request method
        elicitationResponse = await server.request(
          {
            method: 'elicitation/create',
            params: {
              message: `Do you want to post this message to Slack?\n\nChannel: ${channel_id}\nMessage: "${text}"`,
              requestedSchema: {
                type: 'object',
                properties: {
                  confirmed: {
                    type: 'boolean',
                    title: 'Confirm Post',
                    description: 'Confirm that you want to post this message to Slack'
                  }
                },
                required: ['confirmed']
              }
            }
          }
        );

        console.error(elicitationResponse)
        console.log(elicitationResponse)
        // Handle the response based on user action
        if (elicitationResponse.action === 'accept' && elicitationResponse.content?.confirmed === true) {
          // User confirmed, proceed with posting
          const result = await this.postMessage(channel_id, text);
          return {
            ...result,
            elicitation_result: 'accepted',
            message: 'Message posted successfully after user confirmation'
          };
        } else if (elicitationResponse.action === 'decline') {
          // User explicitly declined
          return {
            ok: false,
            error: 'user_declined',
            elicitation_result: 'declined',
            message: 'User declined to post the message'
          };
        } else if (elicitationResponse.action === 'cancel') {
          // User cancelled/dismissed
          return {
            ok: false,
            error: 'user_cancelled',
            elicitation_result: 'cancelled',
            message: 'User cancelled the message posting'
          };
        } else {
          // User accepted but didn't confirm (unchecked the checkbox)
          return {
            ok: false,
            error: 'not_confirmed',
            elicitation_result: 'not_confirmed',
            message: 'User did not confirm the message posting'
          };
        }
      } catch (error) {
        console.error('Elicitation error:', error);
        // Fallback to direct posting if elicitation fails
        const result = await this.postMessage(channel_id, text);
        return {
          ...result,
          elicitation_result: 'fallback',
          message: `'Posted without elicitation due to error' ${elicitationResponse}`,
          elicitation_error: error instanceof Error ? error.message : String(error)
        };
      }
    }
  }