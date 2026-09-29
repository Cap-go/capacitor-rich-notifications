package app.capgo.richnotifications

import android.app.Activity
import android.content.Intent
import android.os.Bundle

/**
 * Translucent trampoline for full-screen intents. Forwards the tap to the plugin then finishes.
 */
class FullScreenActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val id = intent?.getStringExtra(RichNotifications.EXTRA_ID)
        if (!id.isNullOrEmpty()) {
            RichNotificationsPlugin.handlePress(this, id, null, null)
            val launch = packageManager.getLaunchIntentForPackage(packageName)
            if (launch != null) {
                launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
                startActivity(launch)
            }
        }
        finish()
    }
}
