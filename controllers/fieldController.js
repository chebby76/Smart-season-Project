const { validationResult } = require('express-validator');
const { Field, FieldUpdate, User } = require('../models');
const { calculateFieldStatus, updateFieldStatus } = require('../utils/statusCalculator');

/**
 * POST /api/fields
 * Create a new field (Admin only)
 */
const createField = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array(),
      });
    }

    const { name, crop_type, area_size, location, planting_date, assigned_agent_id } = req.body;

    // If assigning an agent, verify they exist and are a field_agent
    if (assigned_agent_id) {
      const agent = await User.findByPk(assigned_agent_id);
      if (!agent || agent.role !== 'field_agent') {
        return res.status(400).json({
          success: false,
          message: 'Invalid agent. The user must exist and have the field_agent role.',
        });
      }
    }

    // Calculate initial status
    const initialStatus = calculateFieldStatus({
      currentStage: 'planted',
      plantingDate: planting_date,
      cropType: crop_type,
    });

    const field = await Field.create({
      name,
      crop_type,
      area_size,
      location,
      planting_date,
      current_stage: 'planted',
      status: initialStatus,
      assigned_agent_id: assigned_agent_id || null,
      created_by: req.user.id,
    });

    // Reload with associations
    const fullField = await Field.findByPk(field.id, {
      include: [
        { model: User, as: 'assignedAgent', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Field created successfully',
      data: { field: fullField },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/fields
 * Get all fields (Admin: all, Agent: only assigned fields)
 */
const getAllFields = async (req, res, next) => {
  try {
    const { status, stage, crop_type } = req.query;

    const where = {};
    if (status) where.status = status;
    if (stage) where.current_stage = stage;
    if (crop_type) where.crop_type = crop_type;

    // Field agents can only see their assigned fields
    if (req.user.role === 'field_agent') {
      where.assigned_agent_id = req.user.id;
    }

    const fields = await Field.findAll({
      where,
      include: [
        { model: User, as: 'assignedAgent', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      ],
      order: [['created_at', 'DESC']],
    });

    // Re-calculate status for all fields (in case time has passed)
    for (const field of fields) {
      await updateFieldStatus(field);
    }

    res.status(200).json({
      success: true,
      data: {
        count: fields.length,
        fields,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/fields/:id
 * Get a single field with its update history
 */
const getFieldById = async (req, res, next) => {
  try {
    const field = await Field.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignedAgent', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        {
          model: FieldUpdate,
          as: 'updates',
          include: [{ model: User, as: 'updatedByUser', attributes: ['id', 'name'] }],
          order: [['created_at', 'DESC']],
        },
      ],
    });

    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Field not found.',
      });
    }

    // Check access: field agents can only view their assigned fields
    if (req.user.role === 'field_agent' && field.assigned_agent_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This field is not assigned to you.',
      });
    }

    // Re-calculate status
    await updateFieldStatus(field);

    res.status(200).json({
      success: true,
      data: { field },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/fields/:id
 * Update field details (Admin only)
 */
const updateField = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array(),
      });
    }

    const field = await Field.findByPk(req.params.id);
    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Field not found.',
      });
    }

    const { name, crop_type, area_size, location, planting_date } = req.body;

    if (name) field.name = name;
    if (crop_type) field.crop_type = crop_type;
    if (area_size !== undefined) field.area_size = area_size;
    if (location) field.location = location;
    if (planting_date) field.planting_date = planting_date;

    await field.save();

    // Recalculate status after update
    await updateFieldStatus(field);

    const fullField = await Field.findByPk(field.id, {
      include: [
        { model: User, as: 'assignedAgent', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Field updated successfully',
      data: { field: fullField },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/fields/:id
 * Delete a field (Admin only)
 */
const deleteField = async (req, res, next) => {
  try {
    const field = await Field.findByPk(req.params.id);
    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Field not found.',
      });
    }

    await field.destroy();

    res.status(200).json({
      success: true,
      message: 'Field deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/fields/:id/assign
 * Assign a field agent to a field (Admin only)
 */
const assignAgent = async (req, res, next) => {
  try {
    const { agent_id } = req.body;

    const field = await Field.findByPk(req.params.id);
    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Field not found.',
      });
    }

    if (agent_id) {
      const agent = await User.findByPk(agent_id);
      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found.',
        });
      }
      if (agent.role !== 'field_agent') {
        return res.status(400).json({
          success: false,
          message: 'The specified user is not a field agent.',
        });
      }
    }

    field.assigned_agent_id = agent_id || null;
    await field.save();

    const fullField = await Field.findByPk(field.id, {
      include: [
        { model: User, as: 'assignedAgent', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      ],
    });

    res.status(200).json({
      success: true,
      message: agent_id ? 'Agent assigned successfully' : 'Agent unassigned successfully',
      data: { field: fullField },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/fields/:id/updates
 * Add a progress update to a field (assigned agent or admin)
 */
const addFieldUpdate = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array(),
      });
    }

    const field = await Field.findByPk(req.params.id);
    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Field not found.',
      });
    }

    // Field agents can only update their assigned fields
    if (req.user.role === 'field_agent' && field.assigned_agent_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This field is not assigned to you.',
      });
    }

    const { new_stage, notes } = req.body;

    // Validate stage progression (can't go backwards except admin override)
    const stageOrder = ['planted', 'growing', 'ready', 'harvested'];
    const currentIndex = stageOrder.indexOf(field.current_stage);
    const newIndex = stageOrder.indexOf(new_stage);

    if (req.user.role === 'field_agent' && newIndex < currentIndex) {
      return res.status(400).json({
        success: false,
        message: `Cannot move stage backwards from "${field.current_stage}" to "${new_stage}". Only admins can reverse stages.`,
      });
    }

    // Create the update record
    const fieldUpdate = await FieldUpdate.create({
      field_id: field.id,
      updated_by: req.user.id,
      new_stage,
      notes,
    });

    // Update the field's current stage
    field.current_stage = new_stage;
    await field.save();

    // Recalculate status
    await updateFieldStatus(field);

    // Reload update with user info
    const fullUpdate = await FieldUpdate.findByPk(fieldUpdate.id, {
      include: [
        { model: User, as: 'updatedByUser', attributes: ['id', 'name'] },
        { model: Field, as: 'field', attributes: ['id', 'name', 'current_stage', 'status'] },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Field update added successfully',
      data: {
        update: fullUpdate,
        field: {
          id: field.id,
          name: field.name,
          current_stage: field.current_stage,
          status: field.status,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/fields/:id/updates
 * Get all updates for a field
 */
const getFieldUpdates = async (req, res, next) => {
  try {
    const field = await Field.findByPk(req.params.id);
    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Field not found.',
      });
    }

    // Field agents can only view updates for their assigned fields
    if (req.user.role === 'field_agent' && field.assigned_agent_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This field is not assigned to you.',
      });
    }

    const updates = await FieldUpdate.findAll({
      where: { field_id: req.params.id },
      include: [
        { model: User, as: 'updatedByUser', attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'DESC']],
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
  createField,
  getAllFields,
  getFieldById,
  updateField,
  deleteField,
  assignAgent,
  addFieldUpdate,
  getFieldUpdates,
};
