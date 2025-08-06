#!/usr/bin/env node

import 'dotenv/config';

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ID = process.env.SUPABASE_PROJECT_ID;
if (!PROJECT_ID) {
  console.error('❌ SUPABASE_PROJECT_ID is not set in .env.development');
  process.exit(1);
}

const TYPES_FILE = join(__dirname, '..', 'src', 'types', 'supabase.ts');

try {
  // Ensure the types directory exists
  const typesDir = dirname(TYPES_FILE);
  if (!existsSync(typesDir)) {
    mkdirSync(typesDir, { recursive: true });
  }

  // Generate types
  console.log('🔄 Generating Supabase types...');
  const command = `npx supabase gen types typescript --project-id "${PROJECT_ID}" > "${TYPES_FILE}"`;
  execSync(command, { stdio: 'inherit' });

  console.log('✅ Types generated successfully!');
} catch (error) {
  console.error('❌ Failed to generate types:', error.message);
  process.exit(1);
}
