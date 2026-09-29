import Foundation
import UserNotifications
import Capacitor

@objc public class RichNotifications: NSObject {
    @objc public func getPluginVersion() -> String {
        return "native"
    }

    /// Generates a notification id when the caller omits one.
    @objc public static func makeId(_ existing: String?) -> String {
        if let existing, !existing.isEmpty {
            return existing
        }
        return UUID().uuidString
    }

    /// Builds a calendar trigger date from a unix millisecond timestamp.
    @objc public static func dateFromUnixMilliseconds(_ millis: Double) -> Date {
        return Date(timeIntervalSince1970: millis / 1000.0)
    }

    /// Builds a time-interval trigger delay in seconds, clamped to a minimum of 1.
    @objc public static func clampedIntervalSeconds(_ seconds: Double) -> TimeInterval {
        return max(1.0, seconds)
    }

    static func mapSettings(_ settings: UNNotificationSettings) -> String {
        switch settings.authorizationStatus {
        case .authorized, .provisional, .ephemeral:
            return "granted"
        case .denied:
            return "blocked"
        case .notDetermined:
            return "denied"
        @unknown default:
            return "unavailable"
        }
    }

    static func applyInterruptionLevel(_ content: UNMutableNotificationContent, level: String) {
        if #available(iOS 15.0, *) {
            switch level {
            case "passive":
                content.interruptionLevel = .passive
            case "timeSensitive":
                content.interruptionLevel = .timeSensitive
            case "critical":
                content.interruptionLevel = .critical
            default:
                content.interruptionLevel = .active
            }
        }
    }

    static func makeUNActions(from actions: [JSObject]) -> [UNNotificationAction] {
        return actions.map { action in
            let actionId = action["id"] as? String ?? UUID().uuidString
            let title = action["title"] as? String ?? actionId
            if action["input"] != nil, (action["input"] as? Bool) != false {
                let placeholder: String
                if let map = action["input"] as? JSObject {
                    placeholder = map["placeholder"] as? String ?? "Reply"
                } else {
                    placeholder = "Reply"
                }
                return UNTextInputNotificationAction(
                    identifier: actionId,
                    title: title,
                    options: [.foreground],
                    textInputButtonTitle: "Send",
                    textInputPlaceholder: placeholder
                )
            }
            return UNNotificationAction(identifier: actionId, title: title, options: [.foreground])
        }
    }

    static func registerCategory(id: String, actions: [JSObject], completion: @escaping () -> Void) {
        let category = UNNotificationCategory(
            identifier: id,
            actions: makeUNActions(from: actions),
            intentIdentifiers: [],
            options: []
        )
        UNUserNotificationCenter.current().getNotificationCategories { existing in
            var next = existing.filter { $0.identifier != id }
            next.insert(category)
            UNUserNotificationCenter.current().setNotificationCategories(next)
            completion()
        }
    }

    static func attachImage(
        content: UNMutableNotificationContent,
        image: String?,
        completion: @escaping () -> Void
    ) {
        guard let image, !image.isEmpty else {
            completion()
            return
        }
        if image.hasPrefix("data:") {
            guard let comma = image.firstIndex(of: ","),
                  let data = Data(base64Encoded: String(image[image.index(after: comma)...])) else {
                completion()
                return
            }
            writeAttachment(data: data, content: content, completion: completion)
            return
        }
        if image.hasPrefix("/") || image.hasPrefix("file:") {
            let path = image.hasPrefix("file:") ? String(image.dropFirst(7)) : image
            let url = URL(fileURLWithPath: path)
            if let attachment = try? UNNotificationAttachment(identifier: "image", url: url, options: nil) {
                content.attachments = [attachment]
            }
            completion()
            return
        }
        guard let url = URL(string: image) else {
            completion()
            return
        }
        URLSession.shared.downloadTask(with: url) { temp, _, _ in
            defer { completion() }
            guard let temp else { return }
            let ext = url.pathExtension.isEmpty ? "jpg" : url.pathExtension
            let dest = FileManager.default.temporaryDirectory
                .appendingPathComponent(UUID().uuidString)
                .appendingPathExtension(ext)
            do {
                try FileManager.default.moveItem(at: temp, to: dest)
                let attachment = try UNNotificationAttachment(identifier: "image", url: dest, options: nil)
                content.attachments = [attachment]
            } catch {
                // Still show the text notification when download/attach fails.
            }
        }.resume()
    }

    private static func writeAttachment(
        data: Data,
        content: UNMutableNotificationContent,
        completion: @escaping () -> Void
    ) {
        let dest = FileManager.default.temporaryDirectory
            .appendingPathComponent(UUID().uuidString)
            .appendingPathExtension("png")
        do {
            try data.write(to: dest)
            let attachment = try UNNotificationAttachment(identifier: "image", url: dest, options: nil)
            content.attachments = [attachment]
        } catch {
            // Ignore attachment failures.
        }
        completion()
    }
}

protocol ContentSource {
    func string(_ key: String) -> String?
    func int(_ key: String) -> Int?
    func array(_ key: String) -> [JSObject]?
}

extension CAPPluginCall: ContentSource {
    func string(_ key: String) -> String? { getString(key) }
    func int(_ key: String) -> Int? { getInt(key) }
    func array(_ key: String) -> [JSObject]? { getArray(key, JSObject.self) }
}

struct JSObjectCall: ContentSource {
    let object: JSObject
    init(_ object: JSObject) { self.object = object }
    func string(_ key: String) -> String? { object[key] as? String }
    func int(_ key: String) -> Int? { object[key] as? Int }
    func array(_ key: String) -> [JSObject]? { object[key] as? [JSObject] }
}
