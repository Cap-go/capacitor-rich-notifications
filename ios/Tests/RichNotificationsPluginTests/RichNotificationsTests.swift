import XCTest
@testable import RichNotificationsPlugin

class RichNotificationsTests: XCTestCase {
    func testEcho() {
        let implementation = RichNotifications()
        let value = "Hello, World!"
        let result = implementation.echo(value)

        XCTAssertEqual(value, result)
    }

    func testGetPluginVersion() {
        let implementation = RichNotifications()
        let result = implementation.getPluginVersion()

        XCTAssertEqual("native", result)
    }
}
