import { TurboModuleRegistry, type TurboModule } from 'react-native';

/**
 * Minimal known-valid TurboModule spec used only by the codegen
 * compatibility test (`src/__tests__/codegenCompat.test.ts`).
 *
 * If a codegen version cannot parse THIS file, that codegen install itself
 * is broken (bad alias install or packaging defect) — the compat test fails
 * with an install-problem message instead of blaming the PushEngage spec.
 * The filename must keep the `Native` prefix or codegen silently skips it.
 */
export interface Spec extends TurboModule {
  ping: (message: string) => Promise<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('CodegenCanary');
