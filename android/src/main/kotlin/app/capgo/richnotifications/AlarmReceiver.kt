package app.capgo.richnotifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * Fires scheduled local notifications from AlarmManager.
 */
class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val id = intent.getStringExtra(RichNotifications.EXTRA_ID) ?: return
        val payload = RichNotifications.loadPending(context, id) ?: return
        RichNotifications.showFromStored(context, payload)
        val repeats = payload.optBoolean("repeats", false)
        val intervalSec = payload.optLong("intervalSec", 0L)
        if (repeats && intervalSec > 0L) {
            RichNotifications.scheduleAlarm(
                context,
                id,
                System.currentTimeMillis() + intervalSec * 1000L,
                true,
                intervalSec,
            )
        } else {
            RichNotifications.removePending(context, id)
        }
    }
}
