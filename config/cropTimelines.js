/**
 * Crop Growth Timelines Configuration
 * 
 * Defines the expected number of days for each growth stage transition.
 * Used by the status calculator to determine if a field is "at risk" (behind schedule).
 * 
 * Format:
 *   cropType: {
 *     planted_to_growing: max days before the field should transition from planted to growing,
 *     growing_to_ready:   max days before the field should transition from growing to ready,
 *     ready_to_harvested: max days before the field should transition from ready to harvested,
 *   }
 * 
 * If a crop type is not listed here, the 'default' timeline will be used.
 */

module.exports = {
  // Cereal crops
  wheat: {
    planted_to_growing: 14,
    growing_to_ready: 90,
    ready_to_harvested: 110,
  },
  corn: {
    planted_to_growing: 10,
    growing_to_ready: 70,
    ready_to_harvested: 95,
  },
  rice: {
    planted_to_growing: 14,
    growing_to_ready: 80,
    ready_to_harvested: 100,
  },

  // Vegetables
  tomato: {
    planted_to_growing: 10,
    growing_to_ready: 50,
    ready_to_harvested: 70,
  },
  potato: {
    planted_to_growing: 14,
    growing_to_ready: 70,
    ready_to_harvested: 90,
  },
  lettuce: {
    planted_to_growing: 7,
    growing_to_ready: 30,
    ready_to_harvested: 45,
  },
  carrot: {
    planted_to_growing: 14,
    growing_to_ready: 55,
    ready_to_harvested: 75,
  },

  // Cash crops
  cotton: {
    planted_to_growing: 14,
    growing_to_ready: 100,
    ready_to_harvested: 130,
  },
  soybean: {
    planted_to_growing: 10,
    growing_to_ready: 75,
    ready_to_harvested: 100,
  },
  sugarcane: {
    planted_to_growing: 21,
    growing_to_ready: 240,
    ready_to_harvested: 300,
  },

  // Default timeline for unlisted crops
  default: {
    planted_to_growing: 14,
    growing_to_ready: 60,
    ready_to_harvested: 90,
  },
};
