package app.capgo.richnotifications

import android.Manifest
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.service.notification.StatusBarNotification
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import com.getcapacitor.annotation.PermissionCallback
import org.json.JSONObject

@CapacitorPlugin(
    name = "RichNotifications",
    permissions = [
        Permission(
            strings = [Manifest.permission.POST_NOTIFICATIONS],
            alias = RichNotificationsPlugin.NOTIFICATIONS_ALIAS,
        ),
    ],
)
class RichNotificationsPlugin : Plugin() {

    companion object {
        const val NOTIFICATIONS_ALIAS = "notifications"
        @Volatile
        private var instance: RichNotificationsPlugin? = null

        fun handlePress(context: Context, id: String, actionId: String?, input: String?) {
            RichNotifications.saveInitial(context, id, actionId, input)
            val plugin = instance
            if (plugin != null) {
                val data = JSObject()
                    .put("id", id)
                    .put("actionId", actionId)
                    .put("input", input)
                plugin.notifyListeners("press", data, true)
            }
        }

        fun handleDismiss(context: Context, id: String) {
            val plugin = instance
            if (plugin != null) {
                plugin.notifyListeners("dismiss", JSObject().put("id", id), true)
            }
        }
    }

    override fun load() {
        super.load()
        instance = this
        RichNotifications.ensureDefaultChannel(context)
    }

    override fun handleOnDestroy() {
        if (instance === this) {
            instance = null
        }
        super.handleOnDestroy()
    }

    override fun handleOnNewIntent(intent: Intent?) {
        super.handleOnNewIntent(intent)
        if (intent == null) return
        val id = intent.getStringExtra(RichNotifications.EXTRA_ID) ?: return
        val actionId = intent.getStringExtra(RichNotifications.EXTRA_ACTION_ID)
        handlePress(context, id, actionId, null)
    }

    @PluginMethod
    fun checkPermission(call: PluginCall) {
        call.resolve(JSObject().put("status", currentPermissionStatus()))
    }

    @PluginMethod
    fun requestPermission(call: PluginCall) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            call.resolve(JSObject().put("status", currentPermissionStatus()))
            return
        }
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) ==
            PackageManager.PERMISSION_GRANTED
        ) {
            call.resolve(JSObject().put("status", "granted"))
            return
        }
        requestPermissionForAlias(NOTIFICATIONS_ALIAS, call, "permissionCallback")
    }

    @PermissionCallback
    private fun permissionCallback(call: PluginCall) {
        call.resolve(JSObject().put("status", currentPermissionStatus()))
    }

    @PluginMethod
    fun createChannel(call: PluginCall) {
        val id = call.getString("id")
        val name = call.getString("name")
        if (id.isNullOrBlank() || name.isNullOrBlank()) {
            call.reject("id and name are required")
            return
        }
        RichNotifications.createChannel(context, call.data)
        call.resolve()
    }

    @PluginMethod
    fun createChannelGroup(call: PluginCall) {
        val id = call.getString("id")
        val name = call.getString("name")
        if (id.isNullOrBlank() || name.isNullOrBlank()) {
            call.reject("id and name are required")
            return
        }
        RichNotifications.createChannelGroup(context, id, name)
        call.resolve()
    }

    @PluginMethod
    fun deleteChannel(call: PluginCall) {
        val id = call.getString("id")
        if (id.isNullOrBlank()) {
            call.reject("id is required")
            return
        }
        RichNotifications.deleteChannel(context, id)
        call.resolve()
    }

    @PluginMethod
    fun display(call: PluginCall) {
        val title = call.getString("title")
        if (title.isNullOrBlank()) {
            call.reject("title is required")
            return
        }
        RichNotifications.displayAsync(context, call.data) { result ->
            bridge.executeOnMainThread {
                result.fold(
                    onSuccess = { id -> call.resolve(JSObject().put("id", id)) },
                    onFailure = { error ->
                        call.reject(error.message ?: "display failed", Exception(error))
                    },
                )
            }
        }
    }

    @PluginMethod
    fun schedule(call: PluginCall) {
        val notification = call.getObject("notification")
        val trigger = call.getObject("trigger")
        if (notification == null || trigger == null) {
            call.reject("notification and trigger are required")
            return
        }
        val title = notification.getString("title")
        if (title.isNullOrBlank()) {
            call.reject("notification.title is required")
            return
        }
        val id = RichNotifications.ensureId(notification.getString("id"))
        notification.put("id", id)

        val type = trigger.getString("type")
        val triggerAt: Long
        var repeats = false
        var intervalSec = 0L
        when (type) {
            "timestamp" -> {
                val raw = trigger.get("timestamp")
                if (raw !is Number) {
                    call.reject("trigger.timestamp is required")
                    return
                }
                triggerAt = raw.toLong()
            }
            "interval" -> {
                val raw = trigger.get("interval")
                if (raw !is Number) {
                    call.reject("trigger.interval is required")
                    return
                }
                intervalSec = raw.toLong()
                repeats = trigger.getBool("repeats") == true
                triggerAt = System.currentTimeMillis() + intervalSec * 1000L
            }
            else -> {
                call.reject("trigger.type must be timestamp or interval")
                return
            }
        }

        val payload = JSONObject(notification.toString())
        payload.put("repeats", repeats)
        payload.put("intervalSec", intervalSec)
        RichNotifications.savePending(context, id, payload)
        RichNotifications.scheduleAlarm(context, id, triggerAt, repeats, intervalSec)
        call.resolve(JSObject().put("id", id))
    }

    @PluginMethod
    fun cancel(call: PluginCall) {
        val id = call.getString("id")
        if (id.isNullOrBlank()) {
            call.reject("id is required")
            return
        }
        RichNotifications.cancelAlarm(context, id)
        NotificationManagerCompat.from(context).cancel(RichNotifications.idToInt(id))
        call.resolve()
    }

    @PluginMethod
    fun cancelAll(call: PluginCall) {
        for (item in RichNotifications.listPending(context)) {
            val id = item.getString("id") ?: continue
            RichNotifications.cancelAlarm(context, id)
        }
        RichNotifications.clearAllPending(context)
        NotificationManagerCompat.from(context).cancelAll()
        call.resolve()
    }

    @PluginMethod
    fun getDisplayed(call: PluginCall) {
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val active: Array<StatusBarNotification> = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            manager.activeNotifications
        } else {
            emptyArray()
        }
        val notifications = JSArray()
        for (status in active) {
            val title = status.notification.extras?.getCharSequence(android.app.Notification.EXTRA_TITLE)?.toString()
            // Prefer string id from extras if we stored it; fall back to hash reverse is impossible, use tag/id string
            val storedId = status.notification.extras?.getString(RichNotifications.EXTRA_ID)
            val id = storedId ?: status.id.toString()
            notifications.put(JSObject().put("id", id).put("title", title))
        }
        call.resolve(JSObject().put("notifications", notifications))
    }

    @PluginMethod
    fun getPending(call: PluginCall) {
        val notifications = JSArray()
        for (item in RichNotifications.listPending(context)) {
            notifications.put(item)
        }
        call.resolve(JSObject().put("notifications", notifications))
    }

    @PluginMethod
    fun getInitialNotification(call: PluginCall) {
        val initial = RichNotifications.loadInitial(context)
        val result = JSObject()
        if (initial == null) {
            result.put("notification", JSONObject.NULL)
        } else {
            result.put(
                "notification",
                JSObject()
                    .put("id", initial.getString("id"))
                    .put("actionId", initial.getString("actionId"))
                    .put("input", initial.getString("input")),
            )
            RichNotifications.clearInitial(context)
        }
        call.resolve(result)
    }

    @PluginMethod
    fun setBadge(call: PluginCall) {
        // Android has no unified badge API across launchers; resolve as no-op.
        call.getInt("count") ?: run {
            call.reject("count is required")
            return
        }
        call.resolve()
    }

    @PluginMethod
    fun registerActions(call: PluginCall) {
        val id = call.getString("id")
        val actions = call.getArray("actions")
        if (id.isNullOrBlank() || actions == null) {
            call.reject("id and actions are required")
            return
        }
        RichNotifications.saveActions(context, id, actions)
        call.resolve()
    }

    @PluginMethod
    fun getPluginVersion(call: PluginCall) {
        call.resolve(JSObject().put("version", RichNotifications.getPluginVersion()))
    }

    private fun currentPermissionStatus(): String {
        if (!NotificationManagerCompat.from(context).areNotificationsEnabled()) {
            return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
                !ActivityCompat.shouldShowRequestPermissionRationale(
                    activity,
                    Manifest.permission.POST_NOTIFICATIONS,
                ) &&
                ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) !=
                PackageManager.PERMISSION_GRANTED
            ) {
                "blocked"
            } else {
                "denied"
            }
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            return if (ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) ==
                PackageManager.PERMISSION_GRANTED
            ) {
                "granted"
            } else {
                "denied"
            }
        }
        return "granted"
    }
}
