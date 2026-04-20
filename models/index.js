const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

// Initialize Sequelize connection
let sequelize;
if (config.dialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: config.storage,
    logging: config.logging,
    define: config.define,
  });
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    define: config.define,
  });
}

// Import models
const User = require('./User')(sequelize);
const Field = require('./Field')(sequelize);
const FieldUpdate = require('./FieldUpdate')(sequelize);

// ==============================
// Define Associations
// ==============================

// User → Fields (as assigned agent)
User.hasMany(Field, {
  foreignKey: 'assigned_agent_id',
  as: 'assignedFields',
});
Field.belongsTo(User, {
  foreignKey: 'assigned_agent_id',
  as: 'assignedAgent',
});

// User → Fields (as creator)
User.hasMany(Field, {
  foreignKey: 'created_by',
  as: 'createdFields',
});
Field.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator',
});

// Field → FieldUpdates
Field.hasMany(FieldUpdate, {
  foreignKey: 'field_id',
  as: 'updates',
});
FieldUpdate.belongsTo(Field, {
  foreignKey: 'field_id',
  as: 'field',
});

// User → FieldUpdates
User.hasMany(FieldUpdate, {
  foreignKey: 'updated_by',
  as: 'fieldUpdates',
});
FieldUpdate.belongsTo(User, {
  foreignKey: 'updated_by',
  as: 'updatedByUser',
});

// Export everything
module.exports = {
  sequelize,
  Sequelize,
  User,
  Field,
  FieldUpdate,
};
