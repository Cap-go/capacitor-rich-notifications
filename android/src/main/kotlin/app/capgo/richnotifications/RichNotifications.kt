package app.capgo.richnotifications

import android.app.AlarmManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationChannelGroup
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Build
import android.util.Base64
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.app.RemoteInput
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.UUID
import java.util.concurrent.Executors

object RichNotifications {
    const val PREFS = "capgo_rich_notifications"
    const val KEY_PENDING = "pending"
    const val KEY_ACTIONS = "actions"
    const val KEY_INITIAL = "initial"
    const val EXTRA_ID = "capgo.rn.id"
    const val EXTRA_ACTION_ID = "capgo.rn.actionId"
    const val EXTRA_NOTIFICATION = "capgo.rn.notification"
    const val ACTION_PRESS = "app.capgo.richnotifications.PRESS"
    const val ACTION_DISMISS = "app.capgo.richnotifications.DISMISS"
    const val REMOTE_INPUT_KEY = "capgo.rn.reply"
    private const val DEFAULT_CHANNEL = "capgo_rich_default"

    private val io = Executors.newCachedThreadPool()

    fun getPluginVersion(): String = "native"

    fun idToInt(id: String): Int = id.hashCode()

    fun ensureId(callId: String?): String = callId?.takeIf { it.isNotBlank() } ?: UUID.randomUUID().toString()

    fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun ensureDefaultChannel(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (manager.getNotificationChannel(DEFAULT_CHANNEL) != null) return
        val channel = NotificationChannel(
            DEFAULT_CHANNEL,
            "General",
            NotificationManager.IMPORTANCE_DEFAULT,
        )
        manager.createNotificationChannel(channel)
    }

    fun createChannel(context: Context, data: JSObject) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val id = data.getString("id") ?: return
        val name = data.getString("name") ?: id
        val importance = mapImportance(data.getString("importance"))
        val channel = NotificationChannel(id, name, importance)
        data.getString("description")?.let { channel.description = it }
        data.getBool("vibration")?.let { channel.enableVibration(it) }
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.createNotificationChannel(channel)
    }

    fun createChannelGroup(context: Context, id: String, name: String) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.createNotificationChannelGroup(NotificationChannelGroup(id, name))
    }

    fun deleteChannel(context: Context, id: String) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.deleteNotificationChannel(id)
    }

    fun saveActions(context: Context, categoryId: String, actions: JSArray) {
        val root = JSONObject(prefs(context).getString(KEY_ACTIONS, "{}") ?: "{}")
        root.put(categoryId, JSONArray(actions.toString()))
        prefs(context).edit().putString(KEY_ACTIONS, root.toString()).apply()
    }

    fun saveInitial(context: Context, id: String, actionId: String?, input: String?) {
        val obj = JSONObject()
            .put("id", id)
            .put("actionId", actionId)
            .put("input", input)
        prefs(context).edit().putString(KEY_INITIAL, obj.toString()).apply()
    }

    fun loadInitial(context: Context): JSObject? {
        val raw = prefs(context).getString(KEY_INITIAL, null) ?: return null
        return try {
            JSObject(raw)
        } catch (_: Exception) {
            null
        }
    }

    fun clearInitial(context: Context) {
        prefs(context).edit().remove(KEY_INITIAL).apply()
    }

    fun savePending(context: Context, id: String, payload: JSONObject) {
        val root = JSONObject(prefs(context).getString(KEY_PENDING, "{}") ?: "{}")
        root.put(id, payload)
        prefs(context).edit().putString(KEY_PENDING, root.toString()).apply()
    }

    fun loadPending(context: Context, id: String): JSONObject? {
        val root = JSONObject(prefs(context).getString(KEY_PENDING, "{}") ?: "{}")
        return root.optJSONObject(id)
    }

    fun removePending(context: Context, id: String) {
        val root = JSONObject(prefs(context).getString(KEY_PENDING, "{}") ?: "{}")
        root.remove(id)
        prefs(context).edit().putString(KEY_PENDING, root.toString()).apply()
    }

    fun listPending(context: Context): List<JSObject> {
        val root = JSONObject(prefs(context).getString(KEY_PENDING, "{}") ?: "{}")
        val out = mutableListOf<JSObject>()
        val keys = root.keys()
        while (keys.hasNext()) {
            val id = keys.next()
            val item = root.optJSONObject(id) ?: continue
            out.add(
                JSObject()
                    .put("id", id)
                    .put("title", item.optString("title", "")),
            )
        }
        return out
    }

    fun clearAllPending(context: Context) {
        prefs(context).edit().putString(KEY_PENDING, "{}").apply()
    }

    fun scheduleAlarm(
        context: Context,
        id: String,
        triggerAt: Long,
        repeats: Boolean,
        intervalSec: Long,
    ) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(context, AlarmReceiver::class.java).apply {
            putExtra(EXTRA_ID, id)
        }
        val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        val pending = PendingIntent.getBroadcast(context, idToInt(id), intent, flags)
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
                alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pending)
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pending)
            } else {
                @Suppress("DEPRECATION")
                alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAt, pending)
            }
        } catch (_: SecurityException) {
            alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pending)
        }
        // repeats / intervalSec are stored in pending payload for AlarmReceiver
        val existing = loadPending(context, id) ?: JSONObject()
        existing.put("repeats", repeats)
        existing.put("intervalSec", intervalSec)
        savePending(context, id, existing)
    }

    fun cancelAlarm(context: Context, id: String) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(context, AlarmReceiver::class.java)
        val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        val pending = PendingIntent.getBroadcast(context, idToInt(id), intent, flags)
        alarmManager.cancel(pending)
        removePending(context, id)
    }

    fun showFromStored(context: Context, payload: JSONObject) {
        val js = JSObject.fromJSONObject(payload)
        display(context, js, startForeground = payload.optBoolean("foregroundService", false))
    }

    fun display(context: Context, notification: JSObject, startForeground: Boolean = false): String {
        ensureDefaultChannel(context)
        val id = ensureId(notification.getString("id"))
        notification.put("id", id)
        val built = buildNotification(context, notification)
        if (startForeground || notification.getBool("foregroundService") == true) {
            val serviceIntent = Intent(context, RichForegroundService::class.java).apply {
                putExtra(EXTRA_ID, id)
                putExtra(EXTRA_NOTIFICATION, built)
            }
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }
            } catch (e: Exception) {
                throw IllegalStateException(
                    "Foreground service failed. Add FOREGROUND_SERVICE permissions and declare " +
                        "app.capgo.richnotifications.RichForegroundService in the app manifest " +
                        "(see scripts/apply-notification-permissions.mjs). ${e.message}",
                )
            }
            return id
        }
        NotificationManagerCompat.from(context).notify(idToInt(id), built)
        return id
    }

    fun buildNotification(context: Context, data: JSObject): Notification {
        val channelId = data.getString("channelId") ?: DEFAULT_CHANNEL
        val id = data.getString("id") ?: ensureId(null)
        val extras = android.os.Bundle().apply { putString(EXTRA_ID, id) }
        val builder = NotificationCompat.Builder(context, channelId)
            .setContentTitle(data.getString("title") ?: "")
            .setContentText(data.getString("body"))
            .setSmallIcon(context.applicationInfo.icon)
            .setAutoCancel(true)
            .setOnlyAlertOnce(true)
            .addExtras(extras)

        data.getInteger("badge")?.let { builder.setNumber(it) }
        if (data.getBool("ongoing") == true) {
            builder.setOngoing(true).setAutoCancel(false)
        }
        data.getString("groupId")?.let { builder.setGroup(it) }

        val progress = data.getJSObject("progress")
        if (progress != null) {
            val max = progress.getInteger("max") ?: 100
            val current = progress.getInteger("current") ?: 0
            val indeterminate = progress.getBool("indeterminate") == true
            builder.setProgress(max, current, indeterminate)
        }

        when (data.getString("style")) {
            "bigtext" -> {
                builder.setStyle(
                    NotificationCompat.BigTextStyle().bigText(data.getString("body") ?: ""),
                )
            }
            "inbox" -> {
                val style = NotificationCompat.InboxStyle()
                val lines = data.optJSONArray("lines")
                if (lines != null) {
                    for (i in 0 until lines.length()) {
                        style.addLine(lines.optString(i))
                    }
                }
                builder.setStyle(style)
            }
            "picture" -> {
                val bitmap = loadBitmap(data.getString("image"))
                if (bitmap != null) {
                    builder.setStyle(
                        NotificationCompat.BigPictureStyle().bigPicture(bitmap).bigLargeIcon(null as Bitmap?),
                    )
                    builder.setLargeIcon(bitmap)
                }
            }
        }

        if (data.getString("style") != "picture") {
            loadBitmap(data.getString("image"))?.let { builder.setLargeIcon(it) }
        }

        val contentIntent = Intent(context, ActionReceiver::class.java).apply {
            action = ACTION_PRESS
            putExtra(EXTRA_ID, id)
        }
        builder.setContentIntent(
            PendingIntent.getBroadcast(
                context,
                idToInt("$id-content"),
                contentIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            ),
        )

        val dismissIntent = Intent(context, ActionReceiver::class.java).apply {
            action = ACTION_DISMISS
            putExtra(EXTRA_ID, id)
        }
        builder.setDeleteIntent(
            PendingIntent.getBroadcast(
                context,
                idToInt("$id-dismiss"),
                dismissIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            ),
        )

        if (data.getBool("fullScreen") == true) {
            val fullScreen = Intent(context, FullScreenActivity::class.java).apply {
                putExtra(EXTRA_ID, id)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            builder.setFullScreenIntent(
                PendingIntent.getActivity(
                    context,
                    idToInt("$id-fs"),
                    fullScreen,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
                ),
                true,
            )
            builder.setPriority(NotificationCompat.PRIORITY_MAX)
            builder.setCategory(NotificationCompat.CATEGORY_CALL)
        }

        resolveActions(context, data).forEachIndexed { index, action ->
            addAction(context, builder, id, action, index)
        }

        return builder.build()
    }

    private fun resolveActions(context: Context, data: JSObject): List<JSONObject> {
        val inline = data.optJSONArray("actions")
        if (inline != null && inline.length() > 0) {
            return (0 until inline.length()).map { inline.getJSONObject(it) }
        }
        val categoryId = data.getString("categoryId") ?: return emptyList()
        val root = JSONObject(prefs(context).getString(KEY_ACTIONS, "{}") ?: "{}")
        val arr = root.optJSONArray(categoryId) ?: return emptyList()
        return (0 until arr.length()).map { arr.getJSONObject(it) }
    }

    private fun addAction(
        context: Context,
        builder: NotificationCompat.Builder,
        notificationId: String,
        action: JSONObject,
        index: Int,
    ) {
        val actionId = action.optString("id", "action-$index")
        val title = action.optString("title", actionId)
        val intent = Intent(context, ActionReceiver::class.java).apply {
            this.action = ACTION_PRESS
            putExtra(EXTRA_ID, notificationId)
            putExtra(EXTRA_ACTION_ID, actionId)
        }
        val hasInput = action.has("input") && action.get("input") != JSONObject.NULL && action.get("input") != false
        val flags = if (hasInput) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        }
        val pending = PendingIntent.getBroadcast(
            context,
            idToInt("$notificationId-$actionId"),
            intent,
            flags,
        )
        val actionBuilder = NotificationCompat.Action.Builder(0, title, pending)
        if (hasInput) {
            val placeholder = when (val input = action.opt("input")) {
                is JSONObject -> input.optString("placeholder", "Reply")
                else -> "Reply"
            }
            actionBuilder.addRemoteInput(
                RemoteInput.Builder(REMOTE_INPUT_KEY).setLabel(placeholder).build(),
            )
        }
        builder.addAction(actionBuilder.build())
    }

    private fun mapImportance(value: String?): Int {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return 0
        return when (value) {
            "none" -> NotificationManager.IMPORTANCE_NONE
            "min" -> NotificationManager.IMPORTANCE_MIN
            "low" -> NotificationManager.IMPORTANCE_LOW
            "high" -> NotificationManager.IMPORTANCE_HIGH
            "max" -> NotificationManager.IMPORTANCE_MAX
            else -> NotificationManager.IMPORTANCE_DEFAULT
        }
    }

    private fun loadBitmap(image: String?): Bitmap? {
        if (image.isNullOrBlank()) return null
        return try {
            when {
                image.startsWith("data:") -> {
                    val base64 = image.substringAfter("base64,", "")
                    val bytes = Base64.decode(base64, Base64.DEFAULT)
                    BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                }
                image.startsWith("http") -> {
                    // Sync load is only used from caller threads that already accept work; keep short timeout.
                    val connection = URL(image).openConnection() as HttpURLConnection
                    connection.connectTimeout = 4000
                    connection.readTimeout = 4000
                    connection.inputStream.use { BitmapFactory.decodeStream(it) }
                }
                else -> BitmapFactory.decodeFile(image)
            }
        } catch (_: Exception) {
            null
        }
    }

    fun displayAsync(context: Context, notification: JSObject, onDone: (Result<String>) -> Unit) {
        io.execute {
            try {
                onDone(Result.success(display(context, notification)))
            } catch (e: Exception) {
                onDone(Result.failure(e))
            }
        }
    }
}
