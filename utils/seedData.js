/**
 * Seed Data Utility
 * 
 * Seeds the database with demo data:
 * - 1 Admin user
 * - 2 Field Agent users
 * - 6 Sample fields with different stages and crop types
 * - Several field updates
 * 
 * Usage: npm run seed
 */

require('dotenv').config();
const { sequelize, User, Field, FieldUpdate } = require('../models');
const { calculateFieldStatus } = require('./statusCalculator');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seed...\n');

    // Force sync all tables (drops existing data)
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created\n');

    // ==============================
    // Create Users
    // ==============================
    console.log('👤 Creating users...');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@smartseason.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log(`   ✅ Admin: ${admin.email} (password: admin123)`);

    const agent1 = await User.create({
      name: 'John Field',
      email: 'john@smartseason.com',
      password: 'agent123',
      role: 'field_agent',
    });
    console.log(`   ✅ Agent: ${agent1.email} (password: agent123)`);

    const agent2 = await User.create({
      name: 'Sarah Green',
      email: 'sarah@smartseason.com',
      password: 'agent123',
      role: 'field_agent',
    });
    console.log(`   ✅ Agent: ${agent2.email} (password: agent123)\n`);

    // ==============================
    // Create Fields
    // ==============================
    console.log('🌾 Creating fields...');

    // Helper to get a date N days ago
    const daysAgo = (days) => {
      const d = new Date();
      d.setDate(d.getDate() - days);
      return d.toISOString().split('T')[0];
    };

    const fields = [
      {
        name: 'North Wheat Field',
        crop_type: 'wheat',
        area_size: 25.5,
        location: 'North Section, Block A',
        planting_date: daysAgo(30),
        current_stage: 'growing',
        assigned_agent_id: agent1.id,
        created_by: admin.id,
      },
      {
        name: 'East Corn Field',
        crop_type: 'corn',
        area_size: 15.0,
        location: 'East Section, Block B',
        planting_date: daysAgo(80),
        current_stage: 'growing', // Behind schedule — should be "ready" by now
        assigned_agent_id: agent1.id,
        created_by: admin.id,
      },
      {
        name: 'South Tomato Garden',
        crop_type: 'tomato',
        area_size: 5.0,
        location: 'South Section, Block C',
        planting_date: daysAgo(75),
        current_stage: 'harvested',
        assigned_agent_id: agent2.id,
        created_by: admin.id,
      },
      {
        name: 'West Rice Paddy',
        crop_type: 'rice',
        area_size: 40.0,
        location: 'West Section, Block D',
        planting_date: daysAgo(10),
        current_stage: 'planted',
        assigned_agent_id: agent2.id,
        created_by: admin.id,
      },
      {
        name: 'Central Potato Field',
        crop_type: 'potato',
        area_size: 12.0,
        location: 'Central Section',
        planting_date: daysAgo(50),
        current_stage: 'growing',
        assigned_agent_id: agent1.id,
        created_by: admin.id,
      },
      {
        name: 'South Cotton Field',
        crop_type: 'cotton',
        area_size: 30.0,
        location: 'South Section, Block E',
        planting_date: daysAgo(5),
        current_stage: 'planted',
        assigned_agent_id: null, // Unassigned
        created_by: admin.id,
      },
    ];

    const createdFields = [];
    for (const fieldData of fields) {
      // Calculate status
      const status = calculateFieldStatus({
        currentStage: fieldData.current_stage,
        plantingDate: fieldData.planting_date,
        cropType: fieldData.crop_type,
      });

      const field = await Field.create({
        ...fieldData,
        status,
      });
      createdFields.push(field);
      console.log(`   ✅ ${field.name} [${field.crop_type}] — Stage: ${field.current_stage}, Status: ${field.status}`);
    }

    console.log('');

    // ==============================
    // Create Field Updates
    // ==============================
    console.log('📝 Creating field updates...');

    const updates = [
      // North Wheat Field updates
      {
        field_id: createdFields[0].id,
        updated_by: agent1.id,
        new_stage: 'growing',
        notes: 'Seeds have germinated well. Good soil moisture levels.',
      },
      // East Corn Field updates
      {
        field_id: createdFields[1].id,
        updated_by: agent1.id,
        new_stage: 'growing',
        notes: 'Corn is growing but slower than expected. Possible nutrient deficiency.',
      },
      // South Tomato Garden updates
      {
        field_id: createdFields[2].id,
        updated_by: agent2.id,
        new_stage: 'growing',
        notes: 'Tomato plants growing strong. Applied first round of fertilizer.',
      },
      {
        field_id: createdFields[2].id,
        updated_by: agent2.id,
        new_stage: 'ready',
        notes: 'Tomatoes are ripe and ready for harvest. Great yield expected.',
      },
      {
        field_id: createdFields[2].id,
        updated_by: agent2.id,
        new_stage: 'harvested',
        notes: 'Harvest complete. Yield: 2.5 tons. Quality: Excellent.',
      },
      // Central Potato Field updates
      {
        field_id: createdFields[4].id,
        updated_by: agent1.id,
        new_stage: 'growing',
        notes: 'Potato shoots are emerging. Field looks healthy.',
      },
    ];

    for (const updateData of updates) {
      await FieldUpdate.create(updateData);
    }
    console.log(`   ✅ Created ${updates.length} field updates\n`);

    // ==============================
    // Summary
    // ==============================
    console.log('═══════════════════════════════════════');
    console.log('  🎉 Seed completed successfully!');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('  Demo Credentials:');
    console.log('  ─────────────────');
    console.log('  Admin:  admin@smartseason.com / admin123');
    console.log('  Agent1: john@smartseason.com  / agent123');
    console.log('  Agent2: sarah@smartseason.com / agent123');
    console.log('');
    console.log(`  Fields created: ${createdFields.length}`);
    console.log(`  Updates created: ${updates.length}`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seedData();
