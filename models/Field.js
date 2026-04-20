const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Field = sequelize.define('Field', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Field name is required' },
        len: { args: [2, 100], msg: 'Field name must be between 2 and 100 characters' },
      },
    },
    crop_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Crop type is required' },
      },
    },
    area_size: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        isDecimal: { msg: 'Area size must be a valid number' },
        min: { args: [0], msg: 'Area size must be positive' },
      },
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    planting_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: { msg: 'Must be a valid date' },
        notEmpty: { msg: 'Planting date is required' },
      },
    },
    current_stage: {
      type: DataTypes.ENUM('planted', 'growing', 'ready', 'harvested'),
      allowNull: false,
      defaultValue: 'planted',
    },
    status: {
      type: DataTypes.ENUM('active', 'at_risk', 'completed'),
      allowNull: false,
      defaultValue: 'active',
    },
    assigned_agent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  }, {
    tableName: 'fields',
    timestamps: true,
    underscored: true,
  });

  return Field;
};
