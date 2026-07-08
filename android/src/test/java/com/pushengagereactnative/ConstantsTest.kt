package com.pushengagereactnative

import org.junit.Assert.assertEquals
import org.junit.Test

class ConstantsTest {

    @Test
    fun moduleName_isPushengageReactNative() {
        // Must match the iOS-side @objc(PushEngageReactNative) registration
        // and the TS-side TurboModuleRegistry.getEnforcing('PushengageReactNative').
        assertEquals("PushengageReactNative", PushengageReactNativeModule.NAME)
    }
}
