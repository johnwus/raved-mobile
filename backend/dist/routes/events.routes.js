"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const events_controller_1 = require("../controllers/events.controller");
const router = (0, express_1.Router)();
// Get events feed
router.get('/', auth_middleware_1.authenticate, events_controller_1.eventsController.getEvents);
// Get single event
router.get('/:eventId', auth_middleware_1.authenticate, events_controller_1.eventsController.getEvent);
// Create event
router.post('/', auth_middleware_1.authenticate, [
    (0, express_validator_1.body)('title').trim().notEmpty().isLength({ max: 200 }),
    (0, express_validator_1.body)('description').optional().trim().isLength({ max: 2000 }),
    (0, express_validator_1.body)('date').isISO8601(),
    (0, express_validator_1.body)('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    (0, express_validator_1.body)('location').trim().notEmpty(),
    (0, express_validator_1.body)('maxAttendees').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('category').isIn(['academic', 'social', 'sports', 'cultural', 'networking', 'other']),
    (0, express_validator_1.body)('audience').isIn(['all', 'faculty', 'graduate', 'undergraduate'])
], events_controller_1.eventsController.createEvent);
// Update event
router.patch('/:eventId', auth_middleware_1.authenticate, events_controller_1.eventsController.updateEvent);
// Delete event
router.delete('/:eventId', auth_middleware_1.authenticate, events_controller_1.eventsController.deleteEvent);
// Attend/unattend event
router.post('/:eventId/attend', auth_middleware_1.authenticate, events_controller_1.eventsController.toggleAttendance);
// Get event attendees
router.get('/:eventId/attendees', auth_middleware_1.authenticate, events_controller_1.eventsController.getEventAttendees);
exports.default = router;
