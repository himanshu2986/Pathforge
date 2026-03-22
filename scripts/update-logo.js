const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'components/navigation/header.tsx',
  'components/navigation/footer.tsx',
  'components/content/info-page.tsx',
  'app/signup/page.tsx',
  'app/login/page.tsx',
  'app/forgot-password/page.tsx',
  'app/dashboard/layout.tsx'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Basic Lucide imports
  content = content.replace(/import \{([^}]*)Zap([^}]*)\} from 'lucide-react'/, (match, p1, p2) => {
    // If Compass is not already imported, add it
    if (!content.includes('Compass,')) {
      return `import {${p1}Compass, Zap${p2}} from 'lucide-react'`;
    }
    return match;
  });

  // App/Dashboard/Layout specific icon import
  if (file === 'app/dashboard/layout.tsx') {
    content = content.replace(/Zap,/, 'Zap, Compass, Shield,');
    
    // Replace the specific logo Zaps
    content = content.replace(/<Zap className="w-6 h-6 text-primary-foreground"/g, '<Compass className="w-6 h-6 text-primary-foreground"');
    content = content.replace(/<Zap className="w-5 h-5 text-primary-foreground"/g, '<Compass className="w-5 h-5 text-primary-foreground"');

    // Replace Admin Command Center Icon
    content = content.replace(/icon: Zap, label: 'Admin Command Center'/g, "icon: Shield, label: 'Admin Command Center'");
  } 
  else {
    // Replace any Zap used as a logo
    content = content.replace(/<Zap className="/g, '<Compass className="');
  }

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});
