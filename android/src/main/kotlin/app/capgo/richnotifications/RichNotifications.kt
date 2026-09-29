package app.capgo.richnotifications

import com.getcapacitor.Logger

class RichNotifications {

    fun echo(value: String): String {
        Logger.info("Echo", value)

        return value
    }

    fun getPluginVersion(): String {
        return "native"
    }
}
