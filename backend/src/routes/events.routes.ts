import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { eventsController } from '../controllers/events.controller';

const router = Router();

// Get events feed
router.get('/', authenticate, eventsController.getEvents);

// Get single event
router.get('/:eventId', authenticate, eventsController.getEvent);

// Create event
router.post('/', authenticate, [
  body('title').trim().notEmpty().isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('date').isISO8601(),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('location').trim().notEmpty(),
  body('maxAttendees').optional().isInt({ min: 1 }),
  body('category').isIn(['academic', 'social', 'sports', 'cultural', 'networking', 'other']),
  body('audience').isIn(['all', 'faculty', 'graduate', 'undergraduate'])
], eventsController.createEvent);

// Update event
router.patch('/:eventId', authenticate, eventsController.updateEvent);

// Delete event
router.delete('/:eventId', authenticate, eventsController.deleteEvent);

// Attend/unattend event
router.post('/:eventId/attend', authenticate, eventsController.toggleAttendance);

// Get event attendees
router.get('/:eventId/attendees', authenticate, eventsController.getEventAttendees);

export default router;