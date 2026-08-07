/**
 * Runs the codegen compatibility matrix (src/__tests__/codegenCompat.test.ts)
 * against @react-native/codegen@latest, installed fresh into a temp dir.
 *
 * The pinned rn-codegen-0.XX devDependencies only cover released RN minors;
 * this script exists so CI (e.g. a nightly/weekly job) catches the NEXT
 * codegen parser tightening before consumer apps do — RN 0.84 broke
 * `trackEvent` five months before anyone noticed.
 *
 * Usage: yarn test:codegen:latest [dist-tag-or-version]
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const requested = process.argv[2] || 'latest';

const installDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pe-codegen-latest-'));
try {
  console.log(`Installing @react-native/codegen@${requested} …`);
  execFileSync(
    'npm',
    [
      'install',
      '--prefix',
      installDir,
      '--no-audit',
      '--no-fund',
      '--no-save',
      `@react-native/codegen@${requested}`,
    ],
    { stdio: 'inherit' }
  );

  const packageDir = path.join(
    installDir,
    'node_modules',
    '@react-native/codegen'
  );
  const { version } = JSON.parse(
    fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8')
  );
  console.log(`Running codegen compatibility matrix against ${version} …`);

  execFileSync(
    path.join(ROOT, 'node_modules', '.bin', 'jest'),
    ['codegenCompat'],
    {
      cwd: ROOT,
      stdio: 'inherit',
      env: {
        ...process.env,
        CODEGEN_COMPAT_EXTRA: packageDir,
      },
    }
  );
} finally {
  fs.rmSync(installDir, { recursive: true, force: true });
}
