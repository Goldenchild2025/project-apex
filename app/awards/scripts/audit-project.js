const fs = require('fs');

const path = require('path');



const requiredFiles = [

  'app/page.tsx',

  'app/dashboard/page.tsx',

  'app/battles/page.tsx',

  'app/components/SubmitFilmModal.tsx',

  'app/components/Navbar.tsx',

  'app/api/submit-film/route.ts',

  'app/api/create-checkout-session/route.ts',

  'app/api/webhooks/stripe/route.ts',

  'lib/supabaseClient.ts',

  'lib/AuthProvider.tsx'

];



console.log('🔍 Running Project-Apex Integration Audit...\n');



let missingCount = 0;



requiredFiles.forEach((file) => {

  const filePath = path.join(process.cwd(), file);

  if (fs.existsSync(filePath)) {

    console.log(`✅ [FOUND] ${file}`);

  } else {

    console.log(`❌ [MISSING] ${file}`);

    missingCount++;

  }

});



console.log('\n----------------------------------------');

if (missingCount === 0) {

  console.log('🎉 Audit Complete: All core Project-Apex components and routes are present!');

} else {

  console.log(`⚠️ Audit Complete: ${missingCount} file(s) missing.`);

} 
