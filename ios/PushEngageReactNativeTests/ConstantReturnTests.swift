import XCTest
@testable import pushengage_react_native

/// Tests for synchronous return values and the bridge's wiring into
/// MessageBuffer. These pin behavior that's easy to break silently
/// (e.g., a stale SDK version string, or a refactor that removes the
/// buffer indirection).
final class ConstantReturnTests: XCTestCase {

    func test_getSdkVersion_returnsExpectedVersion() {
        let bridge = PushEngageReactNative()
        let version = bridge.getSdkVersion()
        // Pinned to whatever the bridge currently advertises. Update this
        // assertion deliberately when the SDK version bumps; the explicit
        // test prevents a silent drift.
        XCTAssertEqual(version, "1.0.0")
    }

    func test_triggerCallback_routesThroughBuffer() {
        let bridge = PushEngageReactNative()

        let exp = expectation(description: "callback fired with payload")
        bridge.setCallback { args in
            XCTAssertEqual(args["deepLink"] as? String, "app://triggered")
            exp.fulfill()
        }
        bridge.triggerCallback(message: ["deepLink": "app://triggered"])
        wait(for: [exp], timeout: 1.0)
    }

    func test_triggerCallback_secondPreCallbackDeliveryReplaysThroughBridge() {
        // The first pre-callback delivery is reserved for the cold-boot slot
        // (drained via getInitialNotification). Subsequent pre-callback
        // deliveries are queued and replayed through setCallback's drain.
        let bridge = PushEngageReactNative()

        bridge.triggerCallback(message: ["deepLink": "app://cold-boot"])
        bridge.triggerCallback(message: ["deepLink": "app://queued"])

        let exp = expectation(description: "queued message replayed via bridge")
        bridge.setCallback { args in
            XCTAssertEqual(args["deepLink"] as? String, "app://queued")
            exp.fulfill()
        }
        wait(for: [exp], timeout: 1.0)
    }

    // MARK: - getInitialNotification (cold-boot pull API)

    func test_getInitialNotification_resolvesWithBufferedColdBootMessage() {
        let bridge = PushEngageReactNative()
        bridge.triggerCallback(message: [
            "deepLink": "app://cold-boot",
            "data": ["k": "v"],
        ])

        let exp = expectation(description: "resolves with initial notification")
        bridge.getInitialNotification(
            resolve: { value in
                guard let dict = value as? [String: Any] else {
                    XCTFail("Expected [String: Any], got \(String(describing: value))")
                    return
                }
                XCTAssertEqual(dict["deepLink"] as? String, "app://cold-boot")
                XCTAssertEqual(dict["data"] as? [String: String], ["k": "v"])
                exp.fulfill()
            },
            reject: { code, message, _ in
                XCTFail("Should not reject: \(code ?? "nil") \(message ?? "nil")")
            }
        )
        wait(for: [exp], timeout: 1.0)
    }

    func test_getInitialNotification_neverDelivered_resolvesNil() {
        let bridge = PushEngageReactNative()

        let exp = expectation(description: "resolves nil when no cold-boot notification")
        bridge.getInitialNotification(
            resolve: { value in
                XCTAssertNil(value)
                exp.fulfill()
            },
            reject: { code, message, _ in
                XCTFail("Should not reject: \(code ?? "nil") \(message ?? "nil")")
            }
        )
        wait(for: [exp], timeout: 1.0)
    }

    func test_getInitialNotification_secondCallResolvesNil() {
        let bridge = PushEngageReactNative()
        bridge.triggerCallback(message: ["deepLink": "app://cold-boot"])

        // Drain.
        let drainExp = expectation(description: "first call resolves")
        bridge.getInitialNotification(
            resolve: { _ in drainExp.fulfill() },
            reject: { _, _, _ in XCTFail("Should not reject") }
        )
        wait(for: [drainExp], timeout: 1.0)

        // Second call should resolve nil — initial notification consumed.
        let secondExp = expectation(description: "second call resolves nil")
        bridge.getInitialNotification(
            resolve: { value in
                XCTAssertNil(value)
                secondExp.fulfill()
            },
            reject: { _, _, _ in XCTFail("Should not reject") }
        )
        wait(for: [secondExp], timeout: 1.0)
    }
}
