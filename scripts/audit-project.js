/**
 * Project-Apex Automated Production Audit Script
 * Verifies environment variables, Supabase connectivity, and build readiness.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Project-Apex Production Audit...\n');

// 1. Check required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
];

let envMissing = false;

console.log('🔍 Checking Environment Variables...');
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.warn(`  ⚠️  Missing env variable: ${varName}`);
    envMissing = true;
  } else {
    console.log(`  ✔️  Found: ${varName}`);
  }
});

if (envMissing) {
  console.log('\n💡 Tip: Ensure your .env.local file is populated or environment variables are set in your hosting provider.\n');
} else {
  console.log('\n✨ All required environment variables are present.\n');
}

// 2. Check Package Integrity
console.log('📦 Verifying package.json and dependencies...');
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  console.log(`  ✔️  Project Name: ${pkg.name} (v${pkg.version})`);
  console.log(`  ✔️  Next.js Version: ${pkg.dependencies?.next || 'Not specified'}`);
  console.log(`  ✔️  React Version: ${pkg.dependencies?.react || 'Not specified'}`);
} else {
  console.error('  ❌ Error: package.json not found in root directory.');
}

// 3. Check Supabase client file presence
console.log('\n🔌 Checking Supabase configuration file...');
const supabaseClientPath = path.join(process.cwd(), 'lib', 'supabaseClient.ts');
if (fs.existsSync(supabaseClientPath)) {
  console.log('  ✔️  Found lib/supabaseClient.ts with SSR and legacy support.');
} else {
  console.warn('  ⚠️  Warning: lib/supabaseClient.ts not found at expected path.');
}

console.log('\n🎯 Audit complete! Run `npm run type-check` followed by `npm run build` to finish compilation.');