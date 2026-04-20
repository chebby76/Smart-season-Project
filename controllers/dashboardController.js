const { Field, FieldUpdate, User } = require('../models');
const { updateFieldStatus } = require('../utils/statusCalculator');

/**
 * GET /api/dashboard/stats
 * Get aggregated dashboard statistics
 * Admin: sees all fields | Agent: sees only assigned fields
 */
const getStats = async (req, res, next) => {
  try {
    const where = {};

    // Field agents only see their own stats
    if (req.user.role === 'field_agent') {
      where.assigned_agent_id = req.user.id;
    }

    // Get all relevant fields
    const fields = await Field.findAll({ where });

    // Recalculate statuses
    for (const field of fields) {
      await updateFieldStatus(field);
    }

    // Aggregate stats
    const totalFields = fields.length;
    const statusBreakdown = {
      active: fields.filter((f) => f.status === 'active').length,
      at_risk: fields.filter((f) => f.status === 'at_risk').length,
      completed: fields.filter((f) => f.status === 'completed').length,
    };
    const stageBreakdown = {
      planted: fields.filter((f) => f.current_stage === 'planted').length,
      growing: fields.filter((f) => f.current_stage === 'growing').length,
      ready: fields.filter((f) => f.current_stage === 'ready').length,
      harvested: fields.filter((f) => f.current_stage === 'harvested').length,
    };

    // Unique crop types
    const cropTypes = [...new Set(fields.map((f) => f.crop_type))];

    // Agent count (admin only)
    let agentCount = 0;
    if (req.user.role === 'admin') {
      agentCount = await User.count({ where: { role: 'field_agent' } });
    }

    res.status(200).json({
      success: true,
      data: {
        totalFields,
        statusBreakdown,
        stageBreakdown,
        cropTypes,
        ...(req.user.role === 'admin' && { agentCount }),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/recent-updates
 * Get the most recent field updates
 * Admin: all updates | Agent: updates on assigned fields
 */
const getRecentUpdates = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const includeOptions = [
      { model: User, as: 'updatedByUser', attributes: ['id', 'name'] },
      {
        model: Field,
        as: 'field',
        attributes: ['id', 'name', 'crop_type', 'current_stage', 'status', 'assigned_agent_id'],
      },
    ];

    let where = {};

    // For field agents, filter to their assigned fields
    if (req.user.role === 'field_agent') {
      // First get the agent's field IDs
      const agentFields = await Field.findAll({
        where: { assigned_agent_id: req.user.id },
        attributes: ['id'],
      });
      const fieldIds = agentFields.map((f) => f.id);
      where.field_id = fieldIds;
    }

    const updates = await FieldUpdate.findAll({
      where,
      include: includeOptions,
      order: [['created_at', 'DESC']],
      limit,
    });

    res.status(200).json({
      success: true,
      data: {
        count: updates.length,
        updates,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getRecentUpdates,
};
