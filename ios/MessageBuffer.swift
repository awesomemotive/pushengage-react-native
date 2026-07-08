import Foundation

/// Cold-boot replay buffer for notification events.
///
/// Background: when iOS launches an app from a tapped push notification, the
/// PushEngage native SDK calls its `notificationOpenHandler` synchronously
/// from inside `setNotificationOpenHandler`. The RN bridge registers that
/// handler during Swift `init()`, but the JS-facing callback is set later
/// by the `.mm` wrapper after `init()` returns. Any notification delivered
/// in that gap would be lost without buffering.
///
/// `MessageBuffer` decouples those two events: deliveries that arrive before
/// the callback is wired are queued; deliveries after fire immediately. When
/// the callback is finally set, any queued messages flush through in arrival
/// order. Access is serialized via NSLock so concurrent deliveries from the
/// SDK are safe.
final class MessageBuffer {
    private var callback: (([String: Any]) -> Void)?
    private var pendingMessages: [[String: Any]] = []
    private var initialNotification: [String: Any]?
    private var initialConsumed: Bool = false
    private let lock = NSLock()

    /// Deliver a notification payload. Fires the callback synchronously if
    /// one is registered, otherwise buffers the payload.
    ///
    /// The first pre-callback delivery — the cold-boot tap — is captured into
    /// the initial-notification slot only, and is exposed exclusively through
    /// `consumeInitialNotification()`. Any subsequent pre-callback deliveries
    /// (rare; would require the SDK to flush more than one queued tap before
    /// `setCallback` runs) are queued for replay through the callback.
    /// Once the callback is registered, deliveries flow through it directly.
    /// The slot and the callback channel never carry the same payload.
    func deliver(_ args: [String: Any]) {
        lock.lock()
        if let cb = callback {
            lock.unlock()
            cb(args)
            return
        }
        if initialNotification == nil && !initialConsumed {
            initialNotification = args
        } else {
            pendingMessages.append(args)
        }
        lock.unlock()
    }

    /// Register (or replace) the callback and immediately replay any
    /// buffered messages in FIFO order.
    func setCallback(_ callback: @escaping ([String: Any]) -> Void) {
        lock.lock()
        self.callback = callback
        let queued = pendingMessages
        pendingMessages.removeAll()
        lock.unlock()
        queued.forEach { callback($0) }
    }

    /// Pop and return the first delivered notification, if any. Idempotent —
    /// returns nil on subsequent calls.
    func consumeInitialNotification() -> [String: Any]? {
        lock.lock()
        let n = initialNotification
        initialNotification = nil
        initialConsumed = true
        lock.unlock()
        return n
    }
}
