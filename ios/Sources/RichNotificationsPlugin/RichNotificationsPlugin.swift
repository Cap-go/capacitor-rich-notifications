import Foundation
import Capacitor
import UserNotifications
import UIKit

@objc(RichNotificationsPlugin)
public class RichNotificationsPlugin: CAPPlugin, CAPBridgedPlugin, UNUserNotificationCenterDelegate {
    public let identifier = "RichNotificationsPlugin"
    public let jsName = "RichNotifications"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "checkPermission", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestPermission", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "createChannel", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "createChannelGroup", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "deleteChannel", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "display", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "schedule", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "cancel", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "cancelAll", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getDisplayed", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getPending", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getInitialNotification", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setBadge", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "registerActions", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getPluginVersion", returnType: CAPPluginReturnPromise)
    ]

    private let implementation = RichNotifications()
    private let initialKey = "capgo.richNotifications.initial"

    override public func load() {
        UNUserNotificationCenter.current().delegate = self
    }

    @objc func checkPermission(_ call: CAPPluginCall) {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            call.resolve(["status": RichNotifications.mapSettings(settings)])
        }
    }

    @objc func requestPermission(_ call: CAPPluginCall) {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, _ in
            if granted {
                call.resolve(["status": "granted"])
                return
            }
            UNUserNotificationCenter.current().getNotificationSettings { settings in
                call.resolve(["status": RichNotifications.mapSettings(settings)])
            }
        }
    }

    @objc func createChannel(_ call: CAPPluginCall) {
        call.resolve()
    }

    @objc func createChannelGroup(_ call: CAPPluginCall) {
        call.resolve()
    }

    @objc func deleteChannel(_ call: CAPPluginCall) {
        call.resolve()
    }

    @objc func display(_ call: CAPPluginCall) {
        guard let title = call.getString("title"), !title.isEmpty else {
            call.reject("title is required")
            return
        }
        let id = RichNotifications.makeId(call.getString("id"))
        buildAndAdd(id: id, data: call, trigger: nil) { error in
            if let error {
                call.reject(error.localizedDescription)
            } else {
                call.resolve(["id": id])
            }
        }
    }

    @objc func schedule(_ call: CAPPluginCall) {
        guard let notification = call.getObject("notification"),
              let title = notification["title"] as? String,
              !title.isEmpty,
              let triggerMap = call.getObject("trigger"),
              let type = triggerMap["type"] as? String else {
            call.reject("notification and trigger are required")
            return
        }
        let id = RichNotifications.makeId(notification["id"] as? String)
        let trigger: UNNotificationTrigger?
        if type == "timestamp", let millis = doubleValue(triggerMap["timestamp"]) {
            let date = RichNotifications.dateFromUnixMilliseconds(millis)
            let comps = Calendar.current.dateComponents(
                [.year, .month, .day, .hour, .minute, .second],
                from: date
            )
            trigger = UNCalendarNotificationTrigger(dateMatching: comps, repeats: false)
        } else if type == "interval", let interval = doubleValue(triggerMap["interval"]) {
            let repeats = triggerMap["repeats"] as? Bool ?? false
            let seconds = RichNotifications.clampedIntervalSeconds(interval)
            trigger = UNTimeIntervalNotificationTrigger(timeInterval: seconds, repeats: repeats)
        } else {
            call.reject("trigger.type must be timestamp or interval")
            return
        }
        buildAndAdd(id: id, data: JSObjectCall(notification), trigger: trigger) { error in
            if let error {
                call.reject(error.localizedDescription)
            } else {
                call.resolve(["id": id])
            }
        }
    }

    @objc func cancel(_ call: CAPPluginCall) {
        guard let id = call.getString("id") else {
            call.reject("id is required")
            return
        }
        let center = UNUserNotificationCenter.current()
        center.removePendingNotificationRequests(withIdentifiers: [id])
        center.removeDeliveredNotifications(withIdentifiers: [id])
        call.resolve()
    }

    @objc func cancelAll(_ call: CAPPluginCall) {
        let center = UNUserNotificationCenter.current()
        center.removeAllPendingNotificationRequests()
        center.removeAllDeliveredNotifications()
        call.resolve()
    }

    @objc func getDisplayed(_ call: CAPPluginCall) {
        UNUserNotificationCenter.current().getDeliveredNotifications { notes in
            let list = notes.map { note -> [String: Any] in
                var item: [String: Any] = ["id": note.request.identifier]
                if !note.request.content.title.isEmpty {
                    item["title"] = note.request.content.title
                }
                return item
            }
            call.resolve(["notifications": list])
        }
    }

    @objc func getPending(_ call: CAPPluginCall) {
        UNUserNotificationCenter.current().getPendingNotificationRequests { requests in
            let list = requests.map { request -> [String: Any] in
                var item: [String: Any] = ["id": request.identifier]
                if !request.content.title.isEmpty {
                    item["title"] = request.content.title
                }
                return item
            }
            call.resolve(["notifications": list])
        }
    }

    @objc func getInitialNotification(_ call: CAPPluginCall) {
        if let data = UserDefaults.standard.dictionary(forKey: initialKey) {
            UserDefaults.standard.removeObject(forKey: initialKey)
            call.resolve(["notification": data])
        } else {
            call.resolve(["notification": NSNull()])
        }
    }

    @objc func setBadge(_ call: CAPPluginCall) {
        guard let count = call.getInt("count") else {
            call.reject("count is required")
            return
        }
        if #available(iOS 16.0, *) {
            UNUserNotificationCenter.current().setBadgeCount(count) { error in
                if let error {
                    call.reject(error.localizedDescription)
                } else {
                    call.resolve()
                }
            }
        } else {
            DispatchQueue.main.async {
                UIApplication.shared.applicationIconBadgeNumber = count
                call.resolve()
            }
        }
    }

    @objc func registerActions(_ call: CAPPluginCall) {
        guard let id = call.getString("id"),
              let actions = call.getArray("actions", JSObject.self) else {
            call.reject("id and actions are required")
            return
        }
        RichNotifications.registerCategory(id: id, actions: actions) {
            call.resolve()
        }
    }

    @objc func getPluginVersion(_ call: CAPPluginCall) {
        call.resolve(["version": implementation.getPluginVersion()])
    }

    public func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        if #available(iOS 14.0, *) {
            completionHandler([.banner, .sound, .badge, .list])
        } else {
            completionHandler([.alert, .sound, .badge])
        }
    }

    public func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        emitResponse(response)
        completionHandler()
    }

    private func emitResponse(_ response: UNNotificationResponse) {
        let id = response.notification.request.identifier
        if response.actionIdentifier == UNNotificationDismissActionIdentifier {
            notifyListeners("dismiss", data: ["id": id])
            return
        }
        var payload: [String: Any] = ["id": id]
        if response.actionIdentifier != UNNotificationDefaultActionIdentifier {
            payload["actionId"] = response.actionIdentifier
        }
        if let textResponse = response as? UNTextInputNotificationResponse {
            payload["input"] = textResponse.userText
        }
        storeInitial(payload)
        notifyListeners("press", data: payload)
    }

    private func storeInitial(_ payload: [String: Any]) {
        UserDefaults.standard.set(payload, forKey: initialKey)
    }

    private func doubleValue(_ value: Any?) -> Double? {
        if let number = value as? Double { return number }
        if let number = value as? Int { return Double(number) }
        if let number = value as? NSNumber { return number.doubleValue }
        return nil
    }

    private func buildAndAdd(
        id: String,
        data: ContentSource,
        trigger: UNNotificationTrigger?,
        completion: @escaping (Error?) -> Void
    ) {
        let content = UNMutableNotificationContent()
        content.title = data.string("title") ?? ""
        if let body = data.string("body") {
            content.body = body
        }
        if let badge = data.int("badge") {
            content.badge = NSNumber(value: badge)
        }
        if let categoryId = data.string("categoryId") {
            content.categoryIdentifier = categoryId
        }
        if let level = data.string("interruptionLevel") {
            RichNotifications.applyInterruptionLevel(content, level: level)
        }
        content.sound = .default

        if let actions = data.array("actions") {
            content.categoryIdentifier = "inline-\(id)"
            RichNotifications.registerCategory(id: "inline-\(id)", actions: actions) {
                self.finishAdd(
                    id: id,
                    content: content,
                    trigger: trigger,
                    image: data.string("image"),
                    completion: completion
                )
            }
            return
        }
        finishAdd(
            id: id,
            content: content,
            trigger: trigger,
            image: data.string("image"),
            completion: completion
        )
    }

    private func finishAdd(
        id: String,
        content: UNMutableNotificationContent,
        trigger: UNNotificationTrigger?,
        image: String?,
        completion: @escaping (Error?) -> Void
    ) {
        RichNotifications.attachImage(content: content, image: image) {
            let request = UNNotificationRequest(identifier: id, content: content, trigger: trigger)
            UNUserNotificationCenter.current().add(request, withCompletionHandler: completion)
        }
    }
}
