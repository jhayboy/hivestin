import { google } from '@googleapis/calendar';

// Initialize Google Calendar client
const calendar = google.calendar({
  version: 'v3',
  auth: new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    null,
    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/calendar']
  )
});

export async function createGoogleMeetLink({ summary, startTime, duration = 30 }) {
  try {
    // Calculate end time
    const endTime = new Date(startTime.getTime() + duration * 60000);

    // Create calendar event with Meet
    const event = {
      summary,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'UTC'
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'UTC'
      },
      conferenceData: {
        createRequest: {
          requestId: `support-call-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      }
    };

    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      conferenceDataVersion: 1,
      resource: event
    });

    // Return the Meet link
    return response.data.conferenceData.entryPoints[0].uri;
  } catch (error) {
    console.error('Error creating Google Meet link:', error);
    throw new Error('Failed to create meeting link');
  }
} 