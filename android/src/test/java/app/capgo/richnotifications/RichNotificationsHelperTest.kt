package app.capgo.richnotifications

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotEquals
import org.junit.Test

class RichNotificationsHelperTest {

    @Test
    fun ensureIdUsesExistingValue() {
        assertEquals("keep-me", RichNotifications.ensureId("keep-me"))
    }

    @Test
    fun ensureIdGeneratesWhenMissingOrBlank() {
        val generated = RichNotifications.ensureId(null)
        assertFalse(generated.isBlank())
        assertFalse(RichNotifications.ensureId("   ").isBlank())
    }

    @Test
    fun idToIntIsStableForSameString() {
        val first = RichNotifications.idToInt("notification-42")
        val second = RichNotifications.idToInt("notification-42")
        assertEquals(first, second)
    }

    @Test
    fun getPluginVersionReturnsNativeMarker() {
        assertEquals("native", RichNotifications.getPluginVersion())
    }

    @Test
    fun idToIntReturnsDifferentValuesForSampleIds() {
        assertNotEquals(RichNotifications.idToInt("a"), RichNotifications.idToInt("b"))
    }
}
