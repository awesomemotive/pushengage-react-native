import XCTest
import React
@testable import pushengage_react_native

/// Tests that the bridge rejects malformed arguments BEFORE reaching any
/// PushEngage SDK call. These verify the guard clauses that protect the
/// SDK from invalid input from JS — purely synchronous and don't need
/// any PushEngage runtime state.
final class ArgumentValidationTests: XCTestCase {

    private var bridge: PushEngageReactNative!

    override func setUp() {
        super.setUp()
        bridge = PushEngageReactNative()
    }

    override func tearDown() {
        bridge = nil
        super.tearDown()
    }

    // Helper: capture rejection details and assert resolve was not called.
    private struct RejectCapture {
        var code: String?
        var message: String?
    }

    private func makeBlocks() -> (RCTPromiseResolveBlock, RCTPromiseRejectBlock, () -> RejectCapture) {
        var capture = RejectCapture()
        let resolve: RCTPromiseResolveBlock = { _ in
            XCTFail("resolve should not be called when validation fails")
        }
        let reject: RCTPromiseRejectBlock = { code, message, _ in
            capture.code = code
            capture.message = message
        }
        return (resolve, reject, { capture })
    }

    // MARK: - addAlert

    func test_addAlert_missingType_rejects() {
        let (resolve, reject, get) = makeBlocks()
        bridge.addAlert(
            ["productId": "p1", "link": "https://x", "price": 9.99] as [String: Any],
            resolve: resolve, reject: reject)
        XCTAssertEqual(get().code, "MISSING_ARGUMENTS")
    }

    func test_addAlert_missingProductId_rejects() {
        let (resolve, reject, get) = makeBlocks()
        bridge.addAlert(
            ["type": "priceDrop", "link": "https://x", "price": 9.99] as [String: Any],
            resolve: resolve, reject: reject)
        XCTAssertEqual(get().code, "MISSING_ARGUMENTS")
    }

    func test_addAlert_missingLink_rejects() {
        let (resolve, reject, get) = makeBlocks()
        bridge.addAlert(
            ["type": "priceDrop", "productId": "p1", "price": 9.99] as [String: Any],
            resolve: resolve, reject: reject)
        XCTAssertEqual(get().code, "MISSING_ARGUMENTS")
    }

    func test_addAlert_missingPrice_rejects() {
        let (resolve, reject, get) = makeBlocks()
        bridge.addAlert(
            ["type": "priceDrop", "productId": "p1", "link": "https://x"] as [String: Any],
            resolve: resolve, reject: reject)
        XCTAssertEqual(get().code, "MISSING_ARGUMENTS")
    }

    // MARK: - array-cast validators

    func test_addDynamicSegment_nonArrayOfDicts_rejects() {
        let (resolve, reject, get) = makeBlocks()
        // [String] when the bridge expects [[String: Any]]
        bridge.addDynamicSegment(["plain-string"] as [Any], resolve: resolve, reject: reject)
        XCTAssertEqual(get().code, "INVALID_ARGUMENT")
    }

    func test_addSegment_nonStringArray_rejects() {
        let (resolve, reject, get) = makeBlocks()
        bridge.addSegment([42, 99] as [Any], resolve: resolve, reject: reject)
        XCTAssertEqual(get().code, "INVALID_ARGUMENT")
    }

    func test_removeSegment_nonStringArray_rejects() {
        let (resolve, reject, get) = makeBlocks()
        bridge.removeSegment([42] as [Any], resolve: resolve, reject: reject)
        XCTAssertEqual(get().code, "INVALID_ARGUMENT")
    }

    func test_deleteSubscriberAttributes_nonStringArray_rejects() {
        let (resolve, reject, get) = makeBlocks()
        bridge.deleteSubscriberAttributes([42] as [Any], resolve: resolve, reject: reject)
        XCTAssertEqual(get().code, "INVALID_ARGUMENT")
    }

    func test_getSubscriberDetails_nonStringArray_rejects() {
        let (resolve, reject, get) = makeBlocks()
        bridge.getSubscriberDetails([42] as [Any], resolve: resolve, reject: reject)
        XCTAssertEqual(get().code, "INVALID_ARGUMENT")
    }
}
