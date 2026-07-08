package com.pushengagereactnative

import com.pushengage.pushengage.PushEngage
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Pure adaptation helpers that translate JS-supplied primitive values into
 * PushEngage SDK enums and types. Kept free of any SDK-state side effects so
 * they're directly testable on the JVM without a live SDK or Robolectric.
 */

object TriggerAlertTypeMapper {
    /**
     * Maps the JS string `"priceDrop"` to `priceDrop`; everything else
     * (including null and unknown values) defaults to `inventory`.
     */
    fun map(typeString: String?): PushEngage.TriggerAlertType =
        if (typeString == "priceDrop") {
            PushEngage.TriggerAlertType.priceDrop
        } else {
            PushEngage.TriggerAlertType.inventory
        }
}

object TriggerAlertAvailabilityMapper {
    /**
     * Maps a JS-supplied availability string to the matching enum value.
     * Returns null for null input, empty strings, or unknown values
     * (matching the prior inline try/catch on `valueOf`).
     */
    fun map(availabilityString: String?): PushEngage.TriggerAlertAvailabilityType? {
        if (availabilityString.isNullOrEmpty()) return null
        return try {
            PushEngage.TriggerAlertAvailabilityType.valueOf(availabilityString)
        } catch (e: IllegalArgumentException) {
            null
        }
    }
}

object TriggerStatusMapper {
    /** Maps `true` → `enabled`, `false` → `disabled`. */
    fun map(status: Boolean): PushEngage.TriggerStatusType =
        if (status) PushEngage.TriggerStatusType.enabled
        else PushEngage.TriggerStatusType.disabled
}

object Iso8601DateParser {
    /**
     * Parses an ISO 8601 date string in the canonical JS form produced by
     * `Date.prototype.toISOString()`: `YYYY-MM-DDTHH:mm:ss.sssZ` (or any
     * equivalent offset, e.g. `+05:30`). The fractional-seconds segment and
     * the timezone designator are both required so the parser behaves
     * identically to the iOS side and never silently re-interprets a UTC
     * string as device-local time.
     *
     * Returns null for null input, empty strings, or formats that don't
     * match.
     */
    fun parse(value: String?): Date? {
        if (value.isNullOrEmpty()) return null
        return try {
            val formatter = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX", Locale.US)
            formatter.isLenient = false
            formatter.parse(value)
        } catch (e: Exception) {
            null
        }
    }
}

object BadgeCountCoercion {
    /**
     * Converts a JS-side `number` (Double on the Kotlin side) into the Int
     * the SDK expects. Non-finite or out-of-range input maps to 0 (which
     * clears the badge) for parity with iOS — Kotlin's `Double.toInt()`
     * would otherwise clamp Infinity to Int.MAX_VALUE, producing a nonsense
     * badge value.
     */
    fun fromDouble(count: Double): Int {
        if (!count.isFinite() ||
            count < Int.MIN_VALUE.toDouble() ||
            count > Int.MAX_VALUE.toDouble()
        ) {
            return 0
        }
        return count.toInt()
    }
}
