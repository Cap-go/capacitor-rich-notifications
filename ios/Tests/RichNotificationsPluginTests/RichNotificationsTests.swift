import XCTest
@testable import RichNotificationsPlugin

class RichNotificationsTests: XCTestCase {
    func testMakeIdUsesExisting() {
        let result = RichNotifications.makeId("keep-me")
        XCTAssertEqual("keep-me", result)
    }

    func testMakeIdGeneratesWhenMissing() {
        let result = RichNotifications.makeId(nil)
        XCTAssertFalse(result.isEmpty)
    }

    func testDateFromUnixMilliseconds() {
        let date = RichNotifications.dateFromUnixMilliseconds(1_700_000_000_000)
        XCTAssertEqual(1_700_000_000, date.timeIntervalSince1970, accuracy: 0.001)
    }

    func testClampedIntervalSeconds() {
        XCTAssertEqual(1.0, RichNotifications.clampedIntervalSeconds(0.2), accuracy: 0.001)
        XCTAssertEqual(5.0, RichNotifications.clampedIntervalSeconds(5), accuracy: 0.001)
    }

    func testGetPluginVersion() {
        let implementation = RichNotifications()
        XCTAssertEqual("native", implementation.getPluginVersion())
    }
}
