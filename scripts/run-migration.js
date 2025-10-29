#!/usr/bin/env node

// Script to run the multi-role system migration
const fs = require('fs');
const path = require('path');

// Read the migration file
const migrationPath = path.join(__dirname, '..', 'sql', 'refactor-to-multi-role-system.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

// Split into individual statements
const statements = migrationSQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log('Multi-Role System Migration');
console.log('============================\n');
console.log('Please run the following SQL in your Supabase SQL Editor:\n');
console.log('https://supabase.com/dashboard/project/eaxtfgicqoaowvyogpic/sql/new\n');
console.log('Or copy and paste this into the Supabase SQL Editor:\n');
console.log('----------------------------------------');
console.log(migrationSQL);
console.log('----------------------------------------\n');
console.log(`Total statements: ${statements.length}`);
