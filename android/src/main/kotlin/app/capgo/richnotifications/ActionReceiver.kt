package app.capgo.richnotifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.app.RemoteInput

/**
 * Handles notification action taps, dismissals, and inline replies.
 */
class ActionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val id = intent.getStringExtra(RichNotifications.EXTRA_ID) ?: return
        when (intent.action) {
            RichNotifications.ACTION_DISMISS -> {
                RichNotificationsPlugin.handleDismiss(context, id)
            }
            RichNotifications.ACTION_PRESS -> {
                val actionId = intent.getStringExtra(RichNotifications.EXTRA_ACTION_ID)
                val results = RemoteInput.getResultsFromIntent(intent)
                val input = results?.getCharSequence(RichNotifications.REMOTE_INPUT_KEY)?.toString()
                RichNotificationsPlugin.handlePress(context, id, actionId, input)
            }
            else -> {
                val actionId = intent.getStringExtra(RichNotifications.EXTRA_ACTION_ID)
                val results = RemoteInput.getResultsFromIntent(intent)
                val input = results?.getCharSequence(RichNotifications.REMOTE_INPUT_KEY)?.toString()
                RichNotificationsPlugin.handlePress(context, id, actionId, input)
            }
        }
    }
}
