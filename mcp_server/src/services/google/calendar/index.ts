import { GoogleCalendarClient } from './client.js';

export const tools = [
  {
    name: 'google_calendar_list_calendars',
    description: 'List all calendars accessible to the authenticated user',
    inputSchema: { 
      type: 'object', 
      properties: { 
        user_google_email: { 
          type: 'string', 
          description: 'The user\'s Google email address' 
        } 
      }, 
      required: ['user_google_email'] 
    },
  },
  {
    name: 'google_calendar_get_events',
    description: 'Get events from a specified calendar',
    inputSchema: {
      type: 'object',
      properties: {
        user_google_email: { type: 'string' },
        calendar_id: { type: 'string', default: 'primary' },
        event_id: { type: 'string' },
        time_min: { type: 'string' },
        time_max: { type: 'string' },
        max_results: { type: 'number', default: 25 },
        query: { type: 'string' },
        detailed: { type: 'boolean', default: false },
      },
      required: ['user_google_email'],
    },
  },
  {
    name: 'google_calendar_create_event',
    description: 'Create a new calendar event',
    inputSchema: {
      type: 'object',
      properties: {
        user_google_email: { type: 'string' },
        summary: { type: 'string' },
        start_time: { type: 'string' },
        end_time: { type: 'string' },
        calendar_id: { type: 'string', default: 'primary' },
        description: { type: 'string' },
        location: { type: 'string' },
        attendees: { type: 'array', items: { type: 'string' } },
        timezone: { type: 'string' },
        add_google_meet: { type: 'boolean', default: false },
        reminders: { type: 'object' },
        use_default_reminders: { type: 'boolean', default: true },
      },
      required: ['user_google_email', 'summary', 'start_time', 'end_time'],
    },
  },
  {
    name: 'google_calendar_modify_event',
    description: 'Modify an existing calendar event',
    inputSchema: {
      type: 'object',
      properties: {
        user_google_email: { type: 'string' },
        event_id: { type: 'string' },
        calendar_id: { type: 'string', default: 'primary' },
        summary: { type: 'string' },
        start_time: { type: 'string' },
        end_time: { type: 'string' },
        description: { type: 'string' },
        location: { type: 'string' },
        attendees: { type: 'array', items: { type: 'string' } },
        timezone: { type: 'string' },
        add_google_meet: { type: 'boolean' },
        reminders: { type: 'object' },
        use_default_reminders: { type: 'boolean' },
      },
      required: ['user_google_email', 'event_id'],
    },
  },
  {
    name: 'google_calendar_delete_event',
    description: 'Delete a calendar event',
    inputSchema: {
      type: 'object',
      properties: {
        user_google_email: { type: 'string' },
        event_id: { type: 'string' },
        calendar_id: { type: 'string', default: 'primary' },
      },
      required: ['user_google_email', 'event_id'],
    },
  },
];

function getClient(accessToken: string) {
  if (!accessToken) throw new Error('Google OAuth access token not provided');
  return new GoogleCalendarClient(accessToken);
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
      case 'google_calendar_list_calendars':
        const calendars = await client.listCalendars();
        return calendars.map((cal: any) => ({
          id: cal.id,
          summary: cal.summary,
          primary: cal.primary,
          timeZone: cal.timeZone,
        }));

      case 'google_calendar_get_events':
        const { 
          calendar_id: getEventsCalendarId = 'primary', 
          event_id, 
          time_min, 
          time_max, 
          max_results = 25, 
          query, 
          detailed = false 
        } = restArgs;
        
        if (event_id) {
          const event = await client.getEvent(getEventsCalendarId, event_id);
          return detailed ? event : {
            id: event.id,
            summary: event.summary,
            start: event.start,
            end: event.end,
            htmlLink: event.htmlLink,
          };
        }
        
        const events = await client.getEvents(getEventsCalendarId, {
          timeMin: time_min,
          timeMax: time_max,
          maxResults: max_results,
          q: query,
        });
        
        return events.map((event: any) => ({
          id: event.id,
          summary: event.summary,
          start: event.start,
          end: event.end,
          location: event.location,
          htmlLink: event.htmlLink,
          ...(detailed && {
            description: event.description,
            attendees: event.attendees,
            creator: event.creator,
            organizer: event.organizer,
            status: event.status,
          }),
        }));

      case 'google_calendar_create_event':
        const { 
          summary, 
          start_time, 
          end_time, 
          description, 
          location, 
          attendees, 
          timezone,
          add_google_meet = false,
          reminders,
          use_default_reminders = true,
          calendar_id: calendarId = 'primary'
        } = restArgs;

        const event: any = {
          summary,
          start: { dateTime: start_time },
          end: { dateTime: end_time },
        };

        if (timezone) {
          event.start.timeZone = timezone;
          event.end.timeZone = timezone;
        }
        if (description) event.description = description;
        if (location) event.location = location;
        if (attendees && attendees.length > 0) {
          event.attendees = attendees.map((email: string) => ({ email }));
        }
        if (add_google_meet) {
          event.conferenceData = {
            createRequest: {
              requestId: Math.random().toString(36).substring(2, 15),
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          };
        }
        if (reminders || !use_default_reminders) {
          event.reminders = {
            useDefault: use_default_reminders,
            ...(reminders && { overrides: reminders }),
          };
        }

        const createdEvent = await client.createEvent(calendarId, event);
        return {
          id: createdEvent.id,
          summary: createdEvent.summary,
          start: createdEvent.start,
          end: createdEvent.end,
          htmlLink: createdEvent.htmlLink,
          hangoutLink: createdEvent.hangoutLink,
        };

      case 'google_calendar_modify_event':
        const { 
          event_id: modifyEventId,
          calendar_id: modifyCalendarId = 'primary',
          summary: modifySummary,
          start_time: modifyStartTime,
          end_time: modifyEndTime,
          description: modifyDescription,
          location: modifyLocation,
          attendees: modifyAttendees,
          timezone: modifyTimezone,
          add_google_meet: modifyAddGoogleMeet,
          reminders: modifyReminders,
          use_default_reminders: modifyUseDefaultReminders,
        } = restArgs;

        const updateEvent: any = {};
        
        if (modifySummary !== undefined) updateEvent.summary = modifySummary;
        if (modifyStartTime) updateEvent.start = { dateTime: modifyStartTime };
        if (modifyEndTime) updateEvent.end = { dateTime: modifyEndTime };
        if (modifyDescription !== undefined) updateEvent.description = modifyDescription;
        if (modifyLocation !== undefined) updateEvent.location = modifyLocation;
        if (modifyAttendees !== undefined) {
          updateEvent.attendees = modifyAttendees.map((email: string) => ({ email }));
        }
        if (modifyTimezone) {
          if (updateEvent.start) updateEvent.start.timeZone = modifyTimezone;
          if (updateEvent.end) updateEvent.end.timeZone = modifyTimezone;
        }
        if (modifyAddGoogleMeet !== undefined) {
          if (modifyAddGoogleMeet) {
            updateEvent.conferenceData = {
              createRequest: {
                requestId: Math.random().toString(36).substring(2, 15),
                conferenceSolutionKey: { type: 'hangoutsMeet' },
              },
            };
          } else {
            updateEvent.conferenceData = null;
          }
        }
        if (modifyReminders !== undefined || modifyUseDefaultReminders !== undefined) {
          updateEvent.reminders = {
            useDefault: modifyUseDefaultReminders ?? true,
            ...(modifyReminders && { overrides: modifyReminders }),
          };
        }

        const updatedEvent = await client.updateEvent(
          modifyCalendarId, 
          modifyEventId, 
          updateEvent
        );
        
        return {
          id: updatedEvent.id,
          summary: updatedEvent.summary,
          start: updatedEvent.start,
          end: updatedEvent.end,
          htmlLink: updatedEvent.htmlLink,
          hangoutLink: updatedEvent.hangoutLink,
        };

      case 'google_calendar_delete_event':
        const { event_id: deleteEventId, calendar_id: deleteCalendarId = 'primary' } = restArgs;
        await client.deleteEvent(deleteCalendarId, deleteEventId);
        return { success: true, message: 'Event deleted successfully' };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    console.error(`Error in ${name}:`, error);
    throw new Error(`Google Calendar API error: ${error.message}`);
  }
}

export const toolNames = tools.map(tool => tool.name);
