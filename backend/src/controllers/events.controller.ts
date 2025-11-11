import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { pgPool } from '../config/database';
import { getTimeAgo } from '../utils';

export const eventsController = {
  // Get events feed
  getEvents: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { category, faculty, page = 1, limit = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let query = `
        SELECT e.*, u.username, u.first_name, u.last_name, u.avatar_url,
               CASE WHEN ea.user_id IS NOT NULL THEN true ELSE false END as is_attending,
               ea.created_at as joined_at
        FROM events e
        JOIN users u ON e.organizer_id = u.id
        LEFT JOIN event_attendees ea ON e.id = ea.event_id AND ea.user_id = $1
        WHERE e.deleted_at IS NULL
      `;

      const params: any[] = [userId];
      let paramIndex = 2;

      // Filter by category
      if (category && category !== 'all') {
        query += ` AND e.category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      // Filter by faculty (if user has faculty preference)
      if (faculty === 'true') {
        const userFaculty = req.user.faculty;
        if (userFaculty) {
          query += ` AND (e.audience = 'all' OR e.audience = 'faculty' OR u.faculty = $${paramIndex})`;
          params.push(userFaculty);
          paramIndex++;
        }
      }

      query += ` ORDER BY e.event_date ASC, e.created_at DESC`;
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parseInt(limit as string), offset);

      const result = await pgPool.query(query, params);

      const events = result.rows.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        eventDate: event.event_date,
        time: event.event_time,
        location: event.location,
        category: event.category,
        audience: event.audience,
        maxAttendees: event.max_attendees,
        currentAttendees: event.current_attendees || 0,
        image: event.image_url,
        organizer: {
          id: event.organizer_id,
          username: event.username,
          name: `${event.first_name} ${event.last_name}`,
          avatarUrl: event.avatar_url
        },
        isAttending: event.is_attending,
        joinedAt: event.joined_at,
        createdAt: event.created_at,
        timeAgo: getTimeAgo(event.created_at)
      }));

      res.json({
        success: true,
        events,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          hasMore: events.length === parseInt(limit as string)
        }
      });

    } catch (error) {
      console.error('Get Events Error:', error);
      res.status(500).json({ error: 'Failed to get events' });
    }
  },

  // Get single event
  getEvent: async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      const result = await pgPool.query(`
        SELECT e.*, u.username, u.first_name, u.last_name, u.avatar_url,
               CASE WHEN ea.user_id IS NOT NULL THEN true ELSE false END as is_attending,
               ea.created_at as joined_at
        FROM events e
        JOIN users u ON e.organizer_id = u.id
        LEFT JOIN event_attendees ea ON e.id = ea.event_id AND ea.user_id = $1
        WHERE e.id = $2 AND e.deleted_at IS NULL
      `, [userId, eventId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const event = result.rows[0];

      // Get attendees list
      const attendeesResult = await pgPool.query(`
        SELECT u.id, u.username, u.first_name, u.last_name, u.avatar_url, u.faculty,
               ea.created_at as joined_at
        FROM event_attendees ea
        JOIN users u ON ea.user_id = u.id
        WHERE ea.event_id = $1
        ORDER BY ea.created_at ASC
        LIMIT 50
      `, [eventId]);

      const attendees = attendeesResult.rows.map(attendee => ({
        id: attendee.id,
        username: attendee.username,
        name: `${attendee.first_name} ${attendee.last_name}`,
        avatarUrl: attendee.avatar_url,
        faculty: attendee.faculty,
        joinedAt: attendee.joined_at
      }));

      res.json({
        success: true,
        event: {
          id: event.id,
          title: event.title,
          description: event.description,
          eventDate: event.event_date,
          time: event.event_time,
          location: event.location,
          category: event.category,
          audience: event.audience,
          maxAttendees: event.max_attendees,
          currentAttendees: event.current_attendees || 0,
          image: event.image_url,
          organizer: {
            id: event.organizer_id,
            username: event.username,
            name: `${event.first_name} ${event.last_name}`,
            avatarUrl: event.avatar_url
          },
          isAttending: event.is_attending,
          joinedAt: event.joined_at,
          attendees,
          createdAt: event.created_at,
          timeAgo: getTimeAgo(event.created_at)
        }
      });

    } catch (error) {
      console.error('Get Event Error:', error);
      res.status(500).json({ error: 'Failed to get event' });
    }
  },

  // Create event
  createEvent: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      const {
        title,
        description,
        date,
        time,
        location,
        maxAttendees,
        category,
        audience,
        image
      } = req.body;

      const result = await pgPool.query(`
        INSERT INTO events (
          organizer_id, title, description, event_date, event_time,
          location, max_attendees, category, audience, image_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        userId, title, description, date, time,
        location, maxAttendees || null, category, audience, image || null
      ]);

      const event = result.rows[0];

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        event: {
          id: event.id,
          title: event.title,
          eventDate: event.event_date,
          time: event.event_time,
          location: event.location,
          category: event.category,
          audience: event.audience,
          createdAt: event.created_at
        }
      });

    } catch (error) {
      console.error('Create Event Error:', error);
      res.status(500).json({ error: 'Failed to create event' });
    }
  },

  // Update event
  updateEvent: async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      // Check if user is the organizer
      const eventCheck = await pgPool.query(
        'SELECT organizer_id FROM events WHERE id = $1 AND deleted_at IS NULL',
        [eventId]
      );

      if (eventCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (eventCheck.rows[0].organizer_id !== userId) {
        return res.status(403).json({ error: 'Only event organizer can update the event' });
      }

      const updates: any = {};
      const values: any[] = [];
      let paramIndex = 1;

      const allowedFields = ['title', 'description', 'event_date', 'event_time', 'location', 'max_attendees', 'category', 'audience', 'image_url'];
      const fieldMapping: any = {
        date: 'event_date',
        time: 'event_time',
        image: 'image_url'
      };

      for (const field of allowedFields) {
        const apiField = Object.keys(fieldMapping).find(key => fieldMapping[key] === field) || field;
        if (req.body[apiField] !== undefined) {
          updates[field] = `$${paramIndex}`;
          values.push(req.body[apiField]);
          paramIndex++;
        }
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      const updateQuery = `
        UPDATE events
        SET ${Object.entries(updates).map(([k, v]) => `${k} = ${v}`).join(', ')},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      values.push(eventId);

      const result = await pgPool.query(updateQuery, values);
      const event = result.rows[0];

      res.json({
        success: true,
        message: 'Event updated successfully',
        event: {
          id: event.id,
          title: event.title,
          eventDate: event.event_date,
          time: event.event_time,
          location: event.location,
          category: event.category,
          audience: event.audience
        }
      });

    } catch (error) {
      console.error('Update Event Error:', error);
      res.status(500).json({ error: 'Failed to update event' });
    }
  },

  // Delete event
  deleteEvent: async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      // Check if user is the organizer
      const eventCheck = await pgPool.query(
        'SELECT organizer_id FROM events WHERE id = $1 AND deleted_at IS NULL',
        [eventId]
      );

      if (eventCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (eventCheck.rows[0].organizer_id !== userId) {
        return res.status(403).json({ error: 'Only event organizer can delete the event' });
      }

      await pgPool.query(
        'UPDATE events SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
        [eventId]
      );

      res.json({
        success: true,
        message: 'Event deleted successfully'
      });

    } catch (error) {
      console.error('Delete Event Error:', error);
      res.status(500).json({ error: 'Failed to delete event' });
    }
  },

  // Attend/unattend event
  toggleAttendance: async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      // Check if event exists and is not full
      const eventResult = await pgPool.query(`
        SELECT max_attendees, current_attendees,
               CASE WHEN ea.user_id IS NOT NULL THEN true ELSE false END as is_attending
        FROM events e
        LEFT JOIN event_attendees ea ON e.id = ea.event_id AND ea.user_id = $1
        WHERE e.id = $2 AND e.deleted_at IS NULL
      `, [userId, eventId]);

      if (eventResult.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const event = eventResult.rows[0];
      const isAttending = event.is_attending;

      if (isAttending) {
        // Remove attendance
        await pgPool.query('DELETE FROM event_attendees WHERE event_id = $1 AND user_id = $2', [eventId, userId]);
        await pgPool.query('UPDATE events SET current_attendees = current_attendees - 1 WHERE id = $1', [eventId]);

        res.json({
          success: true,
          message: 'Successfully unattend event',
          isAttending: false
        });
      } else {
        // Check capacity
        if (event.max_attendees && event.current_attendees >= event.max_attendees) {
          return res.status(400).json({ error: 'Event is full' });
        }

        // Add attendance
        await pgPool.query('INSERT INTO event_attendees (event_id, user_id) VALUES ($1, $2)', [eventId, userId]);
        await pgPool.query('UPDATE events SET current_attendees = current_attendees + 1 WHERE id = $1', [eventId]);

        res.json({
          success: true,
          message: 'Successfully joined event',
          isAttending: true
        });
      }

    } catch (error) {
      console.error('Toggle Attendance Error:', error);
      res.status(500).json({ error: 'Failed to update attendance' });
    }
  },

  // Get event attendees
  getEventAttendees: async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const result = await pgPool.query(`
        SELECT u.id, u.username, u.first_name, u.last_name, u.avatar_url, u.faculty,
               ea.created_at as joined_at
        FROM event_attendees ea
        JOIN users u ON ea.user_id = u.id
        WHERE ea.event_id = $1
        ORDER BY ea.created_at ASC
        LIMIT $2 OFFSET $3
      `, [eventId, parseInt(limit as string), offset]);

      const attendees = result.rows.map(attendee => ({
        id: attendee.id,
        username: attendee.username,
        name: `${attendee.first_name} ${attendee.last_name}`,
        avatarUrl: attendee.avatar_url,
        faculty: attendee.faculty,
        joinedAt: attendee.joined_at,
        timeAgo: getTimeAgo(attendee.joined_at)
      }));

      res.json({
        success: true,
        attendees,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          hasMore: attendees.length === parseInt(limit as string)
        }
      });

    } catch (error) {
      console.error('Get Event Attendees Error:', error);
      res.status(500).json({ error: 'Failed to get event attendees' });
    }
  }
};