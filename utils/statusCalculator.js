const cropTimelines = require('../config/cropTimelines');

/**
 * Calculate the status of a field based on its current stage, planting date, and crop type.
 * 
 * Statuses:
 *   - "completed"  → The field has been harvested
 *   - "at_risk"    → The field's stage is behind schedule
 *   - "active"     → The field is on track
 * 
 * @param {Object} params
 * @param {string} params.currentStage  - One of: planted, growing, ready, harvested
 * @param {string} params.plantingDate  - ISO date string (YYYY-MM-DD)
 * @param {string} params.cropType      - Crop type (e.g., "wheat", "corn")
 * @returns {string} - "active", "at_risk", or "completed"
 */
function calculateFieldStatus({ currentStage, plantingDate, cropType }) {
  // Harvested fields are always completed
  if (currentStage === 'harvested') {
    return 'completed';
  }

  // Get the timeline for this crop type (fallback to default)
  const cropKey = cropType.toLowerCase().trim();
  const timeline = cropTimelines[cropKey] || cropTimelines.default;

  // Calculate days since planting
  const plantDate = new Date(plantingDate);
  const today = new Date();
  const daysSincePlanting = Math.floor((today - plantDate) / (1000 * 60 * 60 * 24));

  // Determine expected maximum days for the current stage
  let maxDaysForCurrentStage;

  switch (currentStage) {
    case 'planted':
      // Should have transitioned to growing by this time
      maxDaysForCurrentStage = timeline.planted_to_growing;
      break;
    case 'growing':
      // Should have transitioned to ready by this time
      maxDaysForCurrentStage = timeline.growing_to_ready;
      break;
    case 'ready':
      // Should have been harvested by this time
      maxDaysForCurrentStage = timeline.ready_to_harvested;
      break;
    default:
      return 'active';
  }

  // If past the expected timeline, the field is at risk
  if (daysSincePlanting > maxDaysForCurrentStage) {
    return 'at_risk';
  }

  return 'active';
}

/**
 * Recalculates and updates the status of a field model instance.
 * Call this after any stage change.
 * 
 * @param {Object} field - Sequelize Field model instance
 * @returns {Object} - The updated field instance
 */
async function updateFieldStatus(field) {
  const newStatus = calculateFieldStatus({
    currentStage: field.current_stage,
    plantingDate: field.planting_date,
    cropType: field.crop_type,
  });

  if (field.status !== newStatus) {
    field.status = newStatus;
    await field.save();
  }

  return field;
}

module.exports = {
  calculateFieldStatus,
  updateFieldStatus,
};
