package com.pushengagereactnative

import com.pushengage.pushengage.PushEngage
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

class MappersTest {

    // MARK: - TriggerAlertTypeMapper

    @Test
    fun triggerAlertType_priceDrop_returnsPriceDrop() {
        assertEquals(PushEngage.TriggerAlertType.priceDrop, TriggerAlertTypeMapper.map("priceDrop"))
    }

    @Test
    fun triggerAlertType_inventory_returnsInventory() {
        assertEquals(PushEngage.TriggerAlertType.inventory, TriggerAlertTypeMapper.map("inventory"))
    }

    @Test
    fun triggerAlertType_unknown_defaultsToInventory() {
        assertEquals(PushEngage.TriggerAlertType.inventory, TriggerAlertTypeMapper.map("nonsense"))
    }

    @Test
    fun triggerAlertType_null_defaultsToInventory() {
        assertEquals(PushEngage.TriggerAlertType.inventory, TriggerAlertTypeMapper.map(null))
    }

    // MARK: - TriggerAlertAvailabilityMapper

    @Test
    fun triggerAvailability_inStock_returnsInStock() {
        assertEquals(
            PushEngage.TriggerAlertAvailabilityType.inStock,
            TriggerAlertAvailabilityMapper.map("inStock")
        )
    }

    @Test
    fun triggerAvailability_outOfStock_returnsOutOfStock() {
        assertEquals(
            PushEngage.TriggerAlertAvailabilityType.outOfStock,
            TriggerAlertAvailabilityMapper.map("outOfStock")
        )
    }

    @Test
    fun triggerAvailability_unknown_returnsNull() {
        assertNull(TriggerAlertAvailabilityMapper.map("partiallyStocked"))
    }

    @Test
    fun triggerAvailability_null_returnsNull() {
        assertNull(TriggerAlertAvailabilityMapper.map(null))
    }

    @Test
    fun triggerAvailability_emptyString_returnsNull() {
        assertNull(TriggerAlertAvailabilityMapper.map(""))
    }

    // MARK: - TriggerStatusMapper

    @Test
    fun triggerStatus_true_returnsEnabled() {
        assertEquals(PushEngage.TriggerStatusType.enabled, TriggerStatusMapper.map(true))
    }

    @Test
    fun triggerStatus_false_returnsDisabled() {
        assertEquals(PushEngage.TriggerStatusType.disabled, TriggerStatusMapper.map(false))
    }

    // MARK: - Iso8601DateParser

    @Test
    fun iso8601_canonicalJsFormat_returnsDate() {
        // Matches `new Date().toISOString()` output exactly — the contract
        // the JS layer ships across the bridge.
        val parsed = Iso8601DateParser.parse("2026-05-27T12:00:00.000Z")
        assertNotNull(parsed)
        // Round-trip verification: format the parsed Date back as UTC and
        // confirm it equals the input we just parsed.
        val roundTripFormatter = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX", Locale.US)
        roundTripFormatter.timeZone = TimeZone.getTimeZone("UTC")
        assertEquals("2026-05-27T12:00:00.000Z", roundTripFormatter.format(parsed!!))
    }

    @Test
    fun iso8601_offsetTimezone_returnsDate() {
        val parsed = Iso8601DateParser.parse("2026-05-27T12:00:00.000+05:30")
        assertNotNull(parsed)
    }

    @Test
    fun iso8601_missingFractionalSeconds_returnsNull() {
        // No `.SSS` — iOS's strict parser also rejects this. Parity test.
        assertNull(Iso8601DateParser.parse("2026-05-27T12:00:00Z"))
    }

    @Test
    fun iso8601_missingTimezone_returnsNull() {
        // No Z / offset — silent local-time interpretation was the bug we
        // just fixed; this test pins the new strict behavior.
        assertNull(Iso8601DateParser.parse("2026-05-27T12:00:00.000"))
    }

    @Test
    fun iso8601_invalidFormat_returnsNull() {
        assertNull(Iso8601DateParser.parse("not-a-date"))
    }

    @Test
    fun iso8601_null_returnsNull() {
        assertNull(Iso8601DateParser.parse(null))
    }

    @Test
    fun iso8601_emptyString_returnsNull() {
        assertNull(Iso8601DateParser.parse(""))
    }

    // MARK: - BadgeCountCoercion

    @Test
    fun badgeCountCoercion_positiveDouble_truncates() {
        assertEquals(3, BadgeCountCoercion.fromDouble(3.9))
    }

    @Test
    fun badgeCountCoercion_negative_stays() {
        assertEquals(-2, BadgeCountCoercion.fromDouble(-2.1))
    }

    @Test
    fun badgeCountCoercion_zero() {
        assertEquals(0, BadgeCountCoercion.fromDouble(0.0))
    }

    @Test
    fun badgeCountCoercion_NaN_returnsZero() {
        assertEquals(0, BadgeCountCoercion.fromDouble(Double.NaN))
    }

    @Test
    fun badgeCountCoercion_positiveInfinity_returnsZero() {
        assertEquals(0, BadgeCountCoercion.fromDouble(Double.POSITIVE_INFINITY))
    }

    @Test
    fun badgeCountCoercion_negativeInfinity_returnsZero() {
        assertEquals(0, BadgeCountCoercion.fromDouble(Double.NEGATIVE_INFINITY))
    }

    @Test
    fun badgeCountCoercion_aboveIntMax_returnsZero() {
        // 2^31 is exactly Int.MAX_VALUE + 1 on JVM.
        assertEquals(0, BadgeCountCoercion.fromDouble(Math.pow(2.0, 31.0)))
    }
}
