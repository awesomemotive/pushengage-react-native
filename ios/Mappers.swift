import Foundation
import PushEngage

/// Pure adaptation helpers that translate JS-supplied primitive values into
/// PushEngage SDK enums and types. Kept free of any SDK-state side effects so
/// they're directly testable without a live SDK instance.
enum TriggerAlertTypeMapper {
    /// Maps the JS string `"priceDrop"` to `.priceDrop`; everything else
    /// (including nil and unknown values) defaults to `.inventory`.
    static func map(_ typeString: String?) -> TriggerAlertType {
        return typeString == "priceDrop" ? .priceDrop : .inventory
    }
}

enum TriggerAlertAvailabilityMapper {
    /// Maps `"inStock"` / `"outOfStock"` to the matching enum; nil and
    /// unknown values produce nil.
    static func map(_ availabilityString: String?) -> TriggerAlertAvailabilityType? {
        switch availabilityString {
        case "inStock": return .inStock
        case "outOfStock": return .outOfStock
        default: return nil
        }
    }
}

enum AutomatedNotificationStatusMapper {
    /// Maps `true` → `.enabled`, `false` → `.disabled`.
    static func map(_ status: Bool) -> TriggerStatusType {
        return status ? .enabled : .disabled
    }
}

enum Iso8601DateParser {
    /// Parses an ISO 8601 date string in the canonical JS form produced by
    /// `Date.prototype.toISOString()`: `YYYY-MM-DDTHH:mm:ss.sssZ` (or any
    /// equivalent offset, e.g. `+05:30`). The fractional-seconds segment is
    /// required so the parser behaves identically to the Android side.
    /// Returns nil for nil input or formats that don't match.
    static func parse(_ value: String?) -> Date? {
        guard let value = value else { return nil }
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter.date(from: value)
    }
}

enum BadgeCountCoercion {
    /// Converts the JS-side `number` (Double) into the Int the SDK expects.
    /// JS numbers can be NaN, Infinity, or beyond Int's range — `Int(_:)`
    /// traps in those cases. Out-of-range or non-finite input maps to 0
    /// (which clears the badge), since negative or absurd badge counts are
    /// not meaningful anyway.
    ///
    /// Floors toward zero (matches Int(Double) semantics for in-range
    /// finite values). `Int(exactly:)` returns nil for NaN, ±Infinity, and
    /// any value outside the representable Int range — including the
    /// 2^63 boundary case where `Double(Int.max)` rounds up to exactly 2^63
    /// (Double's 53-bit mantissa can't represent Int.max precisely).
    static func fromDouble(_ count: Double) -> Int {
        return Int(exactly: count.rounded(.towardZero)) ?? 0
    }
}
