const fs = require('fs');
const path = require('path');

const coreFilesChecks = [
  { name: 'Home Page', paths: ['app/page.tsx', 'src/app/page.tsx'] },
  { name: 'Layout', paths: ['app/layout.tsx', 'src/app/layout.tsx'] },
  { name: 'Dashboard', paths: ['app/dashboard/page.tsx', 'src/app/dashboard/page.tsx'] },
  { name: 'Navbar Component', paths: ['components/Navbar.tsx', 'app/components/Navbar.tsx', 'src/components/Navbar.tsx'] },
  { name: 'Submit Film Modal', paths: ['components/SubmitFilmModal.tsx', 'app/components/SubmitFilmModal.tsx', 'src/components/SubmitFilmModal.tsx'] },
  { name: 'Supabase Server', paths: ['lib/supabaseClient.ts', 'lib/supabase/server.ts', 'utils/supabase/server.ts'] }
];

console.log('🔍 Starting Project-Apex Final Dynamic Audit...\n');
let missingCount = 0;

coreFilesChecks.forEach(item => {
  const foundPath = item.paths.find(p => fs.existsSync(path.join(process.cwd(), p)));
  if (foundPath) {
    console.log(`[✔] Found ${item.name}: (${foundPath})`);
  } else {
    console.log(`[❌] Missing ${item.name}`);
    missingCount++;
  }
});

// Dynamic check for battle feature
const appDir = path.join(process.cwd(), 'app');
let battleFound = false;
if (fs.existsSync(appDir)) {
  const subdirs = fs.readdirSync(appDir);
  const battleDir = subdirs.find(d => d.includes('battle') || d.includes('stad'));
  if (battleDir && fs.existsSync(path.join(appDir, battleDir, 'page.tsx'))) {
    console.log(`[✔] Found Battle Stadia / Stadium: (app/${battleDir}/page.tsx)`);
    battleFound = true;
  }
}

if (!battleFound) {
  console.log(`[❌] Missing Battle Stadia / Stadium route page`);
  missingCount++;
}

console.log('\n-----------------------------------');
if (missingCount === 0) {
  console.log('🎉 All critical core files present and accounted for.');
} else {
  console.log(`⚠️ Warning: ${missingCount} core file(s) require attention.`);
}
