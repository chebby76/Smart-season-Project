/**
 * Quick API Test Script
 * Tests all major endpoints of the SmartSeason API
 */

const http = require('http');

const BASE = 'http://localhost:5000';
let adminToken = '';
let agentToken = '';

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const data = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (data) headers['Content-Length'] = Buffer.byteLength(data);

    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers,
    }, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(responseBody) });
        } catch {
          resolve({ status: res.statusCode, body: responseBody });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function log(label, result) {
  const icon = result.status < 400 ? '✅' : '❌';
  console.log(`${icon} [${result.status}] ${label}`);
  if (result.status >= 400) {
    console.log('   ', JSON.stringify(result.body, null, 2).split('\n').join('\n    '));
  }
}

async function runTests() {
  console.log('\n══════════════════════════════════════');
  console.log('  SmartSeason API Test Suite');
  console.log('══════════════════════════════════════\n');

  // 1. Health check
  let res = await request('GET', '/');
  log('GET / (Health check)', res);

  // 2. Admin Login
  res = await request('POST', '/api/auth/login', {
    email: 'admin@smartseason.com',
    password: 'admin123',
  });
  log('POST /api/auth/login (Admin)', res);
  adminToken = res.body.data.token;

  // 3. Agent Login
  res = await request('POST', '/api/auth/login', {
    email: 'john@smartseason.com',
    password: 'agent123',
  });
  log('POST /api/auth/login (Agent)', res);
  agentToken = res.body.data.token;

  // 4. Get profile
  res = await request('GET', '/api/auth/me', null, adminToken);
  log('GET /api/auth/me (Admin profile)', res);

  // 5. List all users (admin)
  res = await request('GET', '/api/users', null, adminToken);
  log(`GET /api/users (${res.body.data?.count} users)`, res);

  // 6. List all users (agent — should fail)
  res = await request('GET', '/api/users', null, agentToken);
  log('GET /api/users (Agent — should be 403)', res);

  // 7. List all fields (admin)
  res = await request('GET', '/api/fields', null, adminToken);
  log(`GET /api/fields Admin (${res.body.data?.count} fields)`, res);

  // 8. List fields (agent — should see only assigned)
  res = await request('GET', '/api/fields', null, agentToken);
  log(`GET /api/fields Agent (${res.body.data?.count} assigned fields)`, res);

  // 9. Get single field
  res = await request('GET', '/api/fields/1', null, adminToken);
  log(`GET /api/fields/1 (${res.body.data?.field?.name})`, res);

  // 10. Create a new field (admin)
  res = await request('POST', '/api/fields', {
    name: 'Test Soybean Field',
    crop_type: 'soybean',
    area_size: 18.5,
    location: 'Test Area',
    planting_date: '2026-04-10',
    assigned_agent_id: 2,
  }, adminToken);
  log('POST /api/fields (Create new field)', res);
  const newFieldId = res.body.data?.field?.id;

  // 11. Create field (agent — should fail)
  res = await request('POST', '/api/fields', {
    name: 'Illegal Field',
    crop_type: 'wheat',
    planting_date: '2026-04-10',
  }, agentToken);
  log('POST /api/fields (Agent — should be 403)', res);

  // 12. Add field update (agent)
  res = await request('POST', `/api/fields/${newFieldId}/updates`, {
    new_stage: 'growing',
    notes: 'Soybean sprouts emerging. Looking good!',
  }, agentToken);
  log('POST /api/fields/:id/updates (Agent update)', res);

  // 13. Get field updates
  res = await request('GET', `/api/fields/${newFieldId}/updates`, null, agentToken);
  log(`GET /api/fields/:id/updates (${res.body.data?.count} updates)`, res);

  // 14. Dashboard stats (admin)
  res = await request('GET', '/api/dashboard/stats', null, adminToken);
  log('GET /api/dashboard/stats (Admin)', res);
  if (res.body.data) {
    const d = res.body.data;
    console.log(`    Total: ${d.totalFields} | Active: ${d.statusBreakdown.active} | At Risk: ${d.statusBreakdown.at_risk} | Completed: ${d.statusBreakdown.completed}`);
  }

  // 15. Dashboard stats (agent)
  res = await request('GET', '/api/dashboard/stats', null, agentToken);
  log('GET /api/dashboard/stats (Agent)', res);
  if (res.body.data) {
    const d = res.body.data;
    console.log(`    Total: ${d.totalFields} | Active: ${d.statusBreakdown.active} | At Risk: ${d.statusBreakdown.at_risk} | Completed: ${d.statusBreakdown.completed}`);
  }

  // 16. Recent updates
  res = await request('GET', '/api/dashboard/recent-updates?limit=5', null, adminToken);
  log(`GET /api/dashboard/recent-updates (${res.body.data?.count} updates)`, res);

  // 17. Assign agent
  res = await request('PUT', `/api/fields/6/assign`, { agent_id: 3 }, adminToken);
  log('PUT /api/fields/6/assign (Assign agent)', res);

  // 18. Delete field
  res = await request('DELETE', `/api/fields/${newFieldId}`, null, adminToken);
  log('DELETE /api/fields/:id', res);

  // 19. Register new user
  res = await request('POST', '/api/auth/register', {
    name: 'New Agent',
    email: 'newagent@smartseason.com',
    password: 'test123',
    role: 'field_agent',
  });
  log('POST /api/auth/register (New user)', res);

  console.log('\n══════════════════════════════════════');
  console.log('  Tests complete!');
  console.log('══════════════════════════════════════\n');
}

runTests().catch(console.error);
