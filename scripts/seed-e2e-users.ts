// scripts/seed-e2e-users.ts
// Run with: npx ts-node scripts/seed-e2e-users.ts
// Requires DATABASE_URL and E2E_* env vars to be set
//
// Pre-seeds users for Playwright E2E smoke tests.
// Uses ON CONFLICT (email) DO NOTHING — idempotent, safe to re-run.

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'SmokeTest@1234';
const HR_ADMIN_EMAIL = process.env.E2E_HR_ADMIN_EMAIL ?? 'hr-admin@e2e.internal';
const EMPLOYEE_EMAIL = process.env.E2E_EMPLOYEE_EMAIL ?? 'employee@e2e.internal';
const MANAGER_EMAIL = process.env.E2E_MANAGER_EMAIL ?? 'manager@e2e.internal';

async function seed(): Promise<void> {
  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: ['src/**/*.entity.ts'],
    synchronize: false,
  });

  await ds.initialize();

  const passwordHash = await bcrypt.hash(E2E_PASSWORD, 10);

  const users = [
    { email: HR_ADMIN_EMAIL, role: 'HR_ADMIN', name: 'E2E HR Admin' },
    { email: EMPLOYEE_EMAIL, role: 'EMPLOYEE', name: 'E2E Employee' },
    { email: MANAGER_EMAIL, role: 'MANAGER', name: 'E2E Manager' },
  ];

  for (const user of users) {
    await ds.query(
      `INSERT INTO users (id, name, email, password_hash, role, status, is_verified, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'active', true, NOW(), NOW())
       ON CONFLICT (email) DO NOTHING`,
      [user.name, user.email, passwordHash, user.role],
    );
    console.log(`Seeded: ${user.email} (${user.role})`);
  }

  // Seed employee records for EMPLOYEE and MANAGER users
  await ds.query(`
    INSERT INTO employees (id, user_id, employee_code, job_title, joining_date, status, created_at, updated_at)
    SELECT gen_random_uuid(), u.id, 'E2E-' || SUBSTRING(u.id::text, 1, 8), u.role || ' E2E', '2024-01-01', 'active', NOW(), NOW()
    FROM users u
    WHERE u.email = ANY($1)
    ON CONFLICT DO NOTHING
  `, [[EMPLOYEE_EMAIL, MANAGER_EMAIL]]);

  // Link employee to manager
  await ds.query(`
    UPDATE employees e
    SET reporting_manager_id = mgr_emp.id
    FROM users u
    JOIN employees mgr_emp ON mgr_emp.user_id = (SELECT id FROM users WHERE email = $2)
    WHERE u.email = $1 AND e.user_id = u.id
  `, [EMPLOYEE_EMAIL, MANAGER_EMAIL]);

  // Seed leave balances for employee
  await ds.query(`
    INSERT INTO leave_balances (id, employee_id, leave_type, entitled, taken, remaining, leave_year, created_at, updated_at)
    SELECT gen_random_uuid(), e.id, 'ANNUAL', 20, 0, 20, EXTRACT(YEAR FROM NOW()), NOW(), NOW()
    FROM employees e
    JOIN users u ON e.user_id = u.id
    WHERE u.email = $1
    ON CONFLICT DO NOTHING
  `, [EMPLOYEE_EMAIL]);

  await ds.destroy();
  console.log('E2E seed complete.');
}

seed().catch((e) => { console.error(e); process.exit(1); });
