import { z } from 'zod';

// Basic Slack types
export const SlackUserSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  real_name: z.string().optional(),
  display_name: z.string().optional(),
  deleted: z.boolean().optional(),
  is_admin: z.boolean().optional(),
  is_bot: z.boolean().optional(),
  is_owner: z.boolean().optional(),
  is_primary_owner: z.boolean().optional(),
  is_restricted: z.boolean().optional(),
  is_ultra_restricted: z.boolean().optional(),
  profile: z.object({
    avatar_hash: z.string().optional(),
    status_text: z.string().optional(),
    status_emoji: z.string().optional(),
    real_name: z.string().optional(),
    display_name: z.string().optional(),
    display_name_normalized: z.string().optional(),
    email: z.string().optional(),
    image_original: z.string().optional(),
    image_24: z.string().optional(),
    image_32: z.string().optional(),
    image_48: z.string().optional(),
    image_72: z.string().optional(),
    image_192: z.string().optional(),
    image_512: z.string().optional(),
    team: z.string().optional(),
  }).optional(),
});

export const SlackChannelSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  is_channel: z.boolean().optional(),
  is_group: z.boolean().optional(),
  is_im: z.boolean().optional(),
  is_mpim: z.boolean().optional(),
  is_private: z.boolean().optional(),
  created: z.number().optional(),
  is_archived: z.boolean().optional(),
  is_general: z.boolean().optional(),
  unlinked: z.number().optional(),
  name_normalized: z.string().optional(),
  is_shared: z.boolean().optional(),
  is_ext_shared: z.boolean().optional(),
  is_org_shared: z.boolean().optional(),
  pending_shared: z.array(z.unknown()).optional(),
  pending_connected_team_ids: z.array(z.string()).optional(),
  is_pending_ext_shared: z.boolean().optional(),
  is_member: z.boolean().optional(),
  is_open: z.boolean().optional(),
  topic: z.object({
    value: z.string(),
    creator: z.string(),
    last_set: z.number(),
  }).optional(),
  purpose: z.object({
    value: z.string(),
    creator: z.string(),
    last_set: z.number(),
  }).optional(),
  previous_names: z.array(z.string()).optional(),
  num_members: z.number().optional(),
});

export const SlackMessageSchema = z.object({
  type: z.string(),
  ts: z.string(),
  user: z.string().optional(),
  bot_id: z.string().optional(),
  username: z.string().optional(),
  text: z.string().optional(),
  channel: z.string().optional(),
  permalink: z.string().optional(),
  thread_ts: z.string().optional(),
  reply_count: z.number().optional(),
  reply_users_count: z.number().optional(),
  latest_reply: z.string().optional(),
  reply_users: z.array(z.string()).optional(),
  is_locked: z.boolean().optional(),
  subscribed: z.boolean().optional(),
  last_read: z.string().optional(),
  parent_user_id: z.string().optional(),
  reactions: z.array(z.object({
    name: z.string(),
    users: z.array(z.string()),
    count: z.number(),
  })).optional(),
  files: z.array(z.unknown()).optional(),
  upload: z.boolean().optional(),
  edited: z.object({
    user: z.string(),
    ts: z.string(),
  }).optional(),
  subtype: z.string().optional(),
  hidden: z.boolean().optional(),
  deleted_ts: z.string().optional(),
  event_ts: z.string().optional(),
  bot_profile: z.object({
    id: z.string(),
    deleted: z.boolean(),
    name: z.string(),
    updated: z.number(),
    app_id: z.string(),
    username: z.string(),
    icons: z.object({
      image_36: z.string(),
      image_48: z.string(),
      image_72: z.string(),
    }),
    team_id: z.string(),
  }).optional(),
});

// Request schemas
export const ListChannelsRequestSchema = z.object({
  limit: z.number().int().min(1).max(1000).default(100),
  cursor: z.string().optional(),
});

export const PostMessageRequestSchema = z.object({
  channel_id: z.string(),
  text: z.string(),
});

export const ReplyToThreadRequestSchema = z.object({
  channel_id: z.string(),
  thread_ts: z.string(),
  text: z.string(),
});

export const AddReactionRequestSchema = z.object({
  channel_id: z.string(),
  timestamp: z.string(),
  reaction: z.string(),
});

export const GetChannelHistoryRequestSchema = z.object({
  channel_id: z.string(),
  limit: z.number().int().min(1).max(1000).default(100),
  cursor: z.string().optional(),
});

export const GetThreadRepliesRequestSchema = z.object({
  channel_id: z.string(),
  thread_ts: z.string(),
  limit: z.number().int().min(1).max(1000).default(100),
  cursor: z.string().optional(),
});

export const GetUsersRequestSchema = z.object({
  limit: z.number().int().min(1).max(1000).default(100),
  cursor: z.string().optional(),
});

export const GetUserProfilesRequestSchema = z.object({
  user_ids: z.array(z.string()).min(1).max(50),
});

export const SearchMessagesRequestSchema = z.object({
  query: z.string().optional(),
  in_channel: z.string().optional(),
  from_user: z.string().optional(),
  before: z.string().optional(),
  after: z.string().optional(),
  on: z.string().optional(),
  during: z.string().optional(),
  highlight: z.boolean().optional(),
  sort: z.enum(['score', 'timestamp']).optional(),
  sort_dir: z.enum(['asc', 'desc']).optional(),
  count: z.number().int().min(1).max(1000).default(20),
  page: z.number().int().min(1).default(1),
});

export const SearchChannelsRequestSchema = z.object({
  query: z.string(),
  limit: z.number().int().min(1).max(1000).default(100),
  include_archived: z.boolean().default(false),
});

export const SearchUsersRequestSchema = z.object({
  query: z.string(),
  limit: z.number().int().min(1).max(1000).default(100),
  include_bots: z.boolean().default(false),
});

// Response schemas
export const ListChannelsResponseSchema = z.object({
  ok: z.boolean(),
  channels: z.array(SlackChannelSchema).optional(),
  response_metadata: z.object({
    next_cursor: z.string().optional(),
  }).optional(),
  error: z.string().optional(),
});

export const GetUsersResponseSchema = z.object({
  ok: z.boolean(),
  members: z.array(SlackUserSchema).optional(),
  response_metadata: z.object({
    next_cursor: z.string().optional(),
  }).optional(),
  error: z.string().optional(),
});

export const UserProfileResponseSchema = z.object({
  ok: z.boolean(),
  profile: z.object({
    avatar_hash: z.string().optional(),
    status_text: z.string().optional(),
    status_emoji: z.string().optional(),
    real_name: z.string().optional(),
    display_name: z.string().optional(),
    display_name_normalized: z.string().optional(),
    email: z.string().optional(),
    image_original: z.string().optional(),
    image_24: z.string().optional(),
    image_32: z.string().optional(),
    image_48: z.string().optional(),
    image_72: z.string().optional(),
    image_192: z.string().optional(),
    image_512: z.string().optional(),
    team: z.string().optional(),
    title: z.string().optional(),
    phone: z.string().optional(),
    skype: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
  }).optional(),
  error: z.string().optional(),
});

export const GetUserProfilesResponseSchema = z.object({
  profiles: z.array(z.object({
    user_id: z.string(),
    profile: z.object({
      avatar_hash: z.string().optional(),
      status_text: z.string().optional(),
      status_emoji: z.string().optional(),
      real_name: z.string().optional(),
      display_name: z.string().optional(),
      display_name_normalized: z.string().optional(),
      email: z.string().optional(),
      image_original: z.string().optional(),
      image_24: z.string().optional(),
      image_32: z.string().optional(),
      image_48: z.string().optional(),
      image_72: z.string().optional(),
      image_192: z.string().optional(),
      image_512: z.string().optional(),
      team: z.string().optional(),
      title: z.string().optional(),
      phone: z.string().optional(),
      skype: z.string().optional(),
      first_name: z.string().optional(),
      last_name: z.string().optional(),
    }).optional(),
    error: z.string().optional(),
  })),
});

export const ConversationsHistoryResponseSchema = z.object({
  ok: z.boolean(),
  messages: z.array(SlackMessageSchema).optional(),
  has_more: z.boolean().optional(),
  pin_count: z.number().optional(),
  response_metadata: z.object({
    next_cursor: z.string().optional(),
  }).optional(),
  error: z.string().optional(),
});

export const ConversationsRepliesResponseSchema = z.object({
  ok: z.boolean(),
  messages: z.array(SlackMessageSchema).optional(),
  has_more: z.boolean().optional(),
  response_metadata: z.object({
    next_cursor: z.string().optional(),
  }).optional(),
  error: z.string().optional(),
});

export const SearchMessagesResponseSchema = z.object({
  ok: z.boolean(),
  query: z.string().optional(),
  messages: z.object({
    total: z.number(),
    pagination: z.object({
      total_count: z.number(),
      page: z.number(),
      per_page: z.number(),
      page_count: z.number(),
      first: z.number(),
      last: z.number(),
    }),
    paging: z.object({
      count: z.number(),
      total: z.number(),
      page: z.number(),
      pages: z.number(),
    }),
    matches: z.array(z.object({
      type: z.string(),
      ts: z.string(),
      user: z.string().optional(),
      username: z.string().optional(),
      text: z.string().optional(),
      permalink: z.string().optional(),
      previous: z.object({
        type: z.string(),
        ts: z.string(),
        user: z.string().optional(),
        username: z.string().optional(),
        text: z.string().optional(),
      }).optional(),
      previous_2: z.object({
        type: z.string(),
        ts: z.string(),
        user: z.string().optional(),
        username: z.string().optional(),
        text: z.string().optional(),
      }).optional(),
      next: z.object({
        type: z.string(),
        ts: z.string(),
        user: z.string().optional(),
        username: z.string().optional(),
        text: z.string().optional(),
      }).optional(),
      next_2: z.object({
        type: z.string(),
        ts: z.string(),
        user: z.string().optional(),
        username: z.string().optional(),
        text: z.string().optional(),
      }).optional(),
      channel: z.object({
        id: z.string(),
        name: z.string().optional(),
        is_private: z.boolean().optional(),
        is_im: z.boolean().optional(),
        is_mpim: z.boolean().optional(),
      }).optional(),
    })),
  }).optional(),
  error: z.string().optional(),
});
