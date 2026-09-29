package app.capgo.richnotifications

import android.app.Notification
import android.app.Service
import android.content.Intent
import android.os.IBinder
import androidx.core.app.NotificationManagerCompat

/**
 * Opt-in foreground service. The host app must declare this service and related permissions.
 */
class RichForegroundService : Service() {
    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val id = intent?.getStringExtra(RichNotifications.EXTRA_ID) ?: return START_NOT_STICKY
        val notification = if (android.os.Build.VERSION.SDK_INT >= 33) {
            intent.getParcelableExtra(RichNotifications.EXTRA_NOTIFICATION, Notification::class.java)
        } else {
            @Suppress("DEPRECATION")
            intent.getParcelableExtra(RichNotifications.EXTRA_NOTIFICATION)
        }
        if (notification == null) {
            stopSelf()
            return START_NOT_STICKY
        }
        val notificationId = RichNotifications.idToInt(id)
        startForeground(notificationId, notification)
        NotificationManagerCompat.from(this).notify(notificationId, notification)
        return START_STICKY
    }
}
