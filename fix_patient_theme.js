const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'app/patient/register/page.tsx',
  'app/patient/login/page.tsx',
  'app/patient/profile/page.tsx'
];

filesToUpdate.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');

  // Convert basic card containers 
  content = content.replace(/bg-white p-8/g, 'bg-zinc-900/80 backdrop-blur-xl p-8');
  content = content.replace(/bg-white p-6/g, 'bg-zinc-900/80 backdrop-blur-xl p-6');
  content = content.replace(/bg-white border/g, 'bg-zinc-900/80 backdrop-blur-xl border-zinc-800/80 border');
  content = content.replace(/bg-white rounded-xl/g, 'bg-zinc-900/80 backdrop-blur-xl rounded-xl border border-zinc-800/80');
  content = content.replace(/bg-white shadow/g, 'bg-zinc-900/80 backdrop-blur-xl shadow-2xl');
  content = content.replace(/bg-white/g, 'bg-zinc-900/80');
  
  // Convert standard text colors
  content = content.replace(/text-gray-900/g, 'text-zinc-100');
  content = content.replace(/text-gray-800/g, 'text-zinc-200');
  content = content.replace(/text-gray-700/g, 'text-zinc-300');
  content = content.replace(/text-gray-600/g, 'text-zinc-400');
  content = content.replace(/text-gray-500/g, 'text-zinc-400');
  content = content.replace(/text-gray-400/g, 'text-zinc-500');
  
  // Convert standard borders
  content = content.replace(/border-gray-200/g, 'border-zinc-800/80');
  content = content.replace(/border-gray-300/g, 'border-zinc-800/50');
  
  // Convert inputs
  content = content.replace(/<input\s+([^>]*)className="w-full border rounded-md p-2([^"]*)"/g, '<input $1className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl p-3 outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50$2"');
  content = content.replace(/<select\s+([^>]*)className="w-full border rounded-md p-2([^"]*)"/g, '<select $1className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl p-3 outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50$2"');

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated UI tokens in: ${file}`);
});
