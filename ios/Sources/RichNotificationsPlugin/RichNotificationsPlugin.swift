import Foundation
import Capacitor

@objc(RichNotificationsPlugin)
public class RichNotificationsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "RichNotificationsPlugin"
    public let jsName = "RichNotifications"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "echo", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getPluginVersion", returnType: CAPPluginReturnPromise)
    ]

    private let implementation = RichNotifications()

    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        call.resolve([
            "value": implementation.echo(value)
        ])
    }

    @objc func getPluginVersion(_ call: CAPPluginCall) {
        call.resolve([
            "version": implementation.getPluginVersion()
        ])
    }
}
