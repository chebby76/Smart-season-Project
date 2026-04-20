const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// All user routes require authentication + admin role
router.use(authenticate);
router.use(roleCheck('admin'));

/**
 * GET /api/users
 * List all users (can filter by ?role=field_agent)
 */
router.get('/', userController.getAllUsers);

/**
 * GET /api/users/:id
 * Get a single user by ID
 */
router.get('/:id', userController.getUserById);

/**
 * PUT /api/users/:id
 * Update a user
 */
router.put(
  '/:id',
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email')
      .optional()
      .trim()
      .isEmail().withMessage('Must be a valid email address')
      .normalizeEmail(),
    body('role')
      .optional()
      .isIn(['admin', 'field_agent']).withMessage('Role must be admin or field_agent'),
  ],
  userController.updateUser
);

/**
 * DELETE /api/users/:id
 * Delete a user
 */
router.delete('/:id', userController.deleteUser);

module.exports = router;
