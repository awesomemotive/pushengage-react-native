/**
 * Codegen compatibility matrix.
 *
 * Runs the schema parser from every supported React Native minor's
 * `@react-native/codegen` (installed as pinned `rn-codegen-0.XX` dev
 * dependency aliases) against the real TurboModule spec, and asserts the
 * resulting schema contains every method and event emitter declared in the
 * spec source.
 *
 * This is the exact stage that runs during a consumer app's `pod install`
 * (via `generate-codegen-artifacts.js`), so a failure here means every iOS
 * New Architecture build on that RN version is broken at install time —
 * regardless of what our own RN toolchain (see `react-native` in
 * devDependencies) accepts. Codegen's parser has tightened across releases
 * (e.g. 0.84.0 started rejecting `TSTypeLiteral` union members, which broke
 * `trackEvent` in v1.0.0), so every spec change must pass the whole matrix.
 *
 * To check a codegen version that is not pinned here (e.g. the next RN
 * release), run `yarn test:codegen:latest`, which installs
 * `@react-native/codegen@latest` into a temp dir and reruns this file
 * against it via the `CODEGEN_COMPAT_EXTRA` env var (the absolute path of
 * the installed codegen package directory).
 */
import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

jest.setTimeout(120000);

const ROOT = path.resolve(__dirname, '..', '..');
const SPEC_PATH = path.join(ROOT, 'src', 'NativePushengageReactNative.ts');
const CANARY_PATH = path.join(
  ROOT,
  'scripts',
  'codegen-compat',
  'fixtures',
  'NativeCodegenCanary.ts'
);

const PINNED_VERSIONS = [
  '0.78',
  '0.79',
  '0.80',
  '0.81',
  '0.82',
  '0.83',
  '0.84',
  '0.85',
  '0.86',
].map(minor => ({
  label: `RN ${minor}`,
  minor,
  packageDir: path.join(ROOT, 'node_modules', `rn-codegen-${minor}`),
}));

// `yarn test:codegen:latest` injects an ad-hoc codegen install here: the
// env value is the absolute path of the codegen package directory; the
// version label is read from its package.json.
const extraVersion = (packageDir: string) => {
  const { version } = JSON.parse(
    fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8')
  ) as { version: string };
  return { label: `codegen@${version}`, minor: version, packageDir };
};
const extraDir = process.env.CODEGEN_COMPAT_EXTRA;
const EXTRA_VERSIONS = extraDir ? [extraVersion(extraDir)] : [];

const VERSIONS = [...PINNED_VERSIONS, ...EXTRA_VERSIONS];

interface NamedNode {
  name: string;
}

interface CodegenSchema {
  modules: Record<
    string,
    {
      type: string;
      spec: { methods: NamedNode[]; eventEmitters?: NamedNode[] };
    }
  >;
}

type CodegenResult =
  | { ok: true; schema: CodegenSchema }
  | { ok: false; error: string };

const TMP_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pe-codegen-compat-'));
afterAll(() => {
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
});
let schemaCount = 0;

const runCodegen = (packageDir: string, specFile: string): CodegenResult => {
  const cli = path.join(
    packageDir,
    'lib',
    'cli',
    'combine',
    'combine-js-to-schema-cli.js'
  );
  const outFile = path.join(TMP_DIR, `schema-${schemaCount++}.json`);
  try {
    execFileSync(process.execPath, [cli, outFile, specFile], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return {
      ok: true,
      schema: JSON.parse(fs.readFileSync(outFile, 'utf8')) as CodegenSchema,
    };
  } catch (e) {
    const stderr = (e as { stderr?: Buffer }).stderr;
    return { ok: false, error: stderr ? stderr.toString() : String(e) };
  }
};

/**
 * Derives the members codegen must see from the spec source itself, so the
 * matrix automatically covers methods/emitters added later. Counts are
 * sanity-checked in the first test to catch the regexes rotting.
 */
const specSource = fs.readFileSync(SPEC_PATH, 'utf8');
const expectedMethods = [
  ...specSource.matchAll(/^ {2}([A-Za-z0-9_]+): \(/gm),
].flatMap(m => (m[1] ? [m[1]] : []));
const expectedEmitters = [
  ...specSource.matchAll(/^ {2}readonly ([A-Za-z0-9_]+): EventEmitter</gm),
].flatMap(m => (m[1] ? [m[1]] : []));

describe('spec member extraction', () => {
  it('finds the full method and emitter surface in the spec source', () => {
    expect(expectedMethods.length).toBeGreaterThanOrEqual(30);
    expect(expectedMethods).toContain('trackEvent');
    expect(expectedEmitters).toEqual(
      expect.arrayContaining(['onValueChanged', 'onFcmConfigError'])
    );
  });
});

describe.each(VERSIONS)('codegen $label', ({ minor, packageDir }) => {
  it('parses the PushEngage spec with full member coverage', () => {
    const canary = runCodegen(packageDir, CANARY_PATH);
    if (!canary.ok || !canary.schema.modules.NativeCodegenCanary) {
      throw new Error(
        `codegen ${minor} failed on the known-valid canary spec — the codegen install itself is broken (bad alias install or packaging defect), NOT the PushEngage spec:\n${canary.ok ? 'canary module missing from schema' : canary.error}`
      );
    }

    const result = runCodegen(packageDir, SPEC_PATH);
    if (!result.ok) {
      throw new Error(
        `codegen ${minor} rejected src/NativePushengageReactNative.ts — every iOS New Arch build on RN ${minor} fails at pod install:\n${result.error}`
      );
    }

    const moduleSchema = result.schema.modules.NativePushengageReactNative;
    expect(moduleSchema).toBeDefined();
    expect(moduleSchema?.type).toBe('NativeModule');

    const parsedMethods = (moduleSchema?.spec.methods ?? []).map(m => m.name);
    const parsedEmitters = (moduleSchema?.spec.eventEmitters ?? []).map(
      e => e.name
    );
    expect([...parsedMethods].sort()).toEqual([...expectedMethods].sort());
    expect([...parsedEmitters].sort()).toEqual([...expectedEmitters].sort());
  });
});
