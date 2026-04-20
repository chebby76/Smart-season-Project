const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middleware/auth');

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticate);

/**
 * GET /api/dashboard/stats
 * Get aggregated field statistics
 */
router.get('/stats', dashboardController.getStats);

/**
 * GET /api/dashboard/recent-updates
 * Get recent field updates (?limit=10)
 */
router.get('/recent-updates', dashboardController.getRecentUpdates);

module.exports = router;
