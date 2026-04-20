const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FieldUpdate = sequelize.define('FieldUpdate', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    field_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'fields',
        key: 'id',
      },
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    new_stage: {
      type: DataTypes.ENUM('planted', 'growing', 'ready', 'harvested'),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'field_updates',
    timestamps: true,
    underscored: true,
    updatedAt: false, // Field updates are immutable — only created_at matters
  });

  return FieldUpdate;
};
