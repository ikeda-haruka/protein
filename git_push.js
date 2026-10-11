const { spawnSync } = require('child_process');

const input = 'protocol=https\nhost=github.com\n\n';
const credRes = spawnSync('git', ['credential', 'fill'], { input, encoding: 'utf-8' });
const lines = (credRes.stdout || '').split('\n');
let token = '';
for (const line of lines) {
  if (line.startsWith('password=')) token = line.slice(9).trim();
}

function runGit(args) {
  const res = spawnSync('git', args, { encoding: 'utf-8', cwd: 'C:\\gitHub\\protein' });
  console.log(`git ${args.join(' ')}:`, res.stdout || '', res.stderr || '');
  return res;
}

runGit(['init']);
runGit(['config', 'user.name', 'ikeda-haruka']);
runGit(['config', 'user.email', 'ikedaharuka0215@gmail.com']);
runGit(['branch', '-M', 'main']);

// Add all files
runGit(['add', '.']);
runGit(['commit', '-m', 'feat: Initial commit for BERRY MILK PROTEIN landing page']);

// Push to remote using authenticated URL
const remoteUrl = `https://ikeda-haruka:${token}@github.com/ikeda-haruka/protein.git`;
runGit(['remote', 'remove', 'origin']);
runGit(['remote', 'add', 'origin', 'https://github.com/ikeda-haruka/protein.git']);
runGit(['push', '-u', remoteUrl, 'main', '--force']);

console.log('Git push finished.');
