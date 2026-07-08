import XCTest
import PushEngage
@testable import pushengage_react_native

final class ArgumentAdaptationTests: XCTestCase {

    // MARK: - TriggerAlertTypeMapper

    func test_triggerAlertType_priceDrop_mapsCorrectly() {
        XCTAssertEqual(TriggerAlertTypeMapper.map("priceDrop"), .priceDrop)
    }

    func test_triggerAlertType_other_mapsToInventory() {
        XCTAssertEqual(TriggerAlertTypeMapper.map("inventory"), .inventory)
    }

    func test_triggerAlertType_unknownString_mapsToInventory() {
        XCTAssertEqual(TriggerAlertTypeMapper.map("nonsense"), .inventory)
    }

    func test_triggerAlertType_nil_mapsToInventory() {
        XCTAssertEqual(TriggerAlertTypeMapper.map(nil), .inventory)
    }

    // MARK: - TriggerAlertAvailabilityMapper

    func test_triggerAlertAvailability_inStock_maps() {
        XCTAssertEqual(TriggerAlertAvailabilityMapper.map("inStock"), .inStock)
    }

    func test_triggerAlertAvailability_outOfStock_maps() {
        XCTAssertEqual(TriggerAlertAvailabilityMapper.map("outOfStock"), .outOfStock)
    }

    func test_triggerAlertAvailability_unknown_returnsNil() {
        XCTAssertNil(TriggerAlertAvailabilityMapper.map("partiallyStocked"))
    }

    func test_triggerAlertAvailability_nil_returnsNil() {
        XCTAssertNil(TriggerAlertAvailabilityMapper.map(nil))
    }

    // MARK: - Iso8601DateParser

    func test_iso8601_canonicalJsFormat_returnsDate() {
        // Matches `new Date().toISOString()` output exactly — the contract
        // the JS layer ships across the bridge.
        let date = Iso8601DateParser.parse("2026-05-27T12:00:00.000Z")
        XCTAssertNotNil(date)
    }

    func test_iso8601_offsetTimezone_returnsDate() {
        let date = Iso8601DateParser.parse("2026-05-27T12:00:00.000+05:30")
        XCTAssertNotNil(date)
    }

    func test_iso8601_missingFractionalSeconds_returnsNil() {
        // No `.SSS` — Android's strict parser would reject this too. We
        // require parity so a single JS input produces a non-nil Date on
        // both platforms or nil on both.
        XCTAssertNil(Iso8601DateParser.parse("2026-05-27T12:00:00Z"))
    }

    func test_iso8601_missingTimezone_returnsNil() {
        // No Z / offset — same parity rule as above.
        XCTAssertNil(Iso8601DateParser.parse("2026-05-27T12:00:00.000"))
    }

    func test_iso8601_invalidString_returnsNil() {
        XCTAssertNil(Iso8601DateParser.parse("not-a-date"))
    }

    func test_iso8601_nil_returnsNil() {
        XCTAssertNil(Iso8601DateParser.parse(nil))
    }

    // MARK: - AutomatedNotificationStatusMapper

    func test_automatedNotificationStatus_true_mapsEnabled() {
        XCTAssertEqual(AutomatedNotificationStatusMapper.map(true), .enabled)
    }

    func test_automatedNotificationStatus_false_mapsDisabled() {
        XCTAssertEqual(AutomatedNotificationStatusMapper.map(false), .disabled)
    }

    // MARK: - BadgeCountCoercion

    func test_badgeCountCoercion_double_to_int_floors() {
        XCTAssertEqual(BadgeCountCoercion.fromDouble(3.9), 3)
    }

    func test_badgeCountCoercion_NaN_returnsZero() {
        XCTAssertEqual(BadgeCountCoercion.fromDouble(.nan), 0)
    }

    func test_badgeCountCoercion_positiveInfinity_returnsZero() {
        XCTAssertEqual(BadgeCountCoercion.fromDouble(.infinity), 0)
    }

    func test_badgeCountCoercion_negativeInfinity_returnsZero() {
        XCTAssertEqual(BadgeCountCoercion.fromDouble(-.infinity), 0)
    }

    func test_badgeCountCoercion_aboveIntMax_returnsZero() {
        // 2^63 is exactly Int.max + 1, outside the representable range.
        XCTAssertEqual(BadgeCountCoercion.fromDouble(pow(2.0, 63.0)), 0)
    }

    func test_badgeCountCoercion_zero_returnsZero() {
        XCTAssertEqual(BadgeCountCoercion.fromDouble(0), 0)
    }
}
