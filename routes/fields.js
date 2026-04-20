const express = require('express');
const { body } = require('express-validator');
const fieldController = require('../controllers/fieldController');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// All field routes require authentication
router.use(authenticate);

/**
 * POST /api/fields
 * Create a new field (Admin only)
 */
router.post(
  '/',
  roleCheck('admin'),
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Field name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('crop_type')
      .trim()
      .notEmpty().withMessage('Crop type is required'),
    body('area_size')
      .optional()
      .isFloat({ min: 0 }).withMessage('Area size must be a positive number'),
    body('location')
      .optional()
      .trim(),
    body('planting_date')
      .notEmpty().withMessage('Planting date is required')
      .isISO8601().withMessage('Planting date must be a valid date (YYYY-MM-DD)'),
    body('assigned_agent_id')
      .optional()
      .isInt().withMessage('Agent ID must be an integer'),
  ],
  fieldController.createField
);

/**
 * GET /api/fields
 * List fields (Admin: all, Agent: assigned only)
 * Query params: ?status=active&stage=growing&crop_type=wheat
 */
router.get('/', fieldController.getAllFields);

/**
 * GET /api/fields/:id
 * Get a single field with update history
 */
router.get('/:id', fieldController.getFieldById);

/**
 * PUT /api/fields/:id
 * Update field details (Admin only)
 */
router.put(
  '/:id',
  roleCheck('admin'),
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('crop_type')
      .optional()
      .trim(),
    body('area_size')
      .optional()
      .isFloat({ min: 0 }).withMessage('Area size must be a positive number'),
    body('planting_date')
      .optional()
      .isISO8601().withMessage('Planting date must be a valid date (YYYY-MM-DD)'),
  ],
  fieldController.updateField
);

/**
 * DELETE /api/fields/:id
 * Delete a field (Admin only)
 */
router.delete('/:id', roleCheck('admin'), fieldController.deleteField);

/**
 * PUT /api/fields/:id/assign
 * Assign a field agent to a field (Admin only)
 */
router.put(
  '/:id/assign',
  roleCheck('admin'),
  [
    body('agent_id')
      .optional({ nullable: true })
      .isInt().withMessage('Agent ID must be an integer'),
  ],
  fieldController.assignAgent
);

/**
 * POST /api/fields/:id/updates
 * Add a progress update (assigned agent or admin)
 */
router.post(
  '/:id/updates',
  [
    body('new_stage')
      .notEmpty().withMessage('New stage is required')
      .isIn(['planted', 'growing', 'ready', 'harvested'])
      .withMessage('Stage must be one of: planted, growing, ready, harvested'),
    body('notes')
      .optional()
      .trim(),
  ],
  fieldController.addFieldUpdate
);

/**
 * GET /api/fields/:id/updates
 * Get all updates for a field
 */
router.get('/:id/updates', fieldController.getFieldUpdates);

module.exports = router;
