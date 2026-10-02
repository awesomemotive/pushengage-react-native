//
//  PushengageReactNative.swift
//  pushengage-react-native
//
//  Created by Himshikhar Gayan on 11/12/24.
//

import Foundation
import PushEngage
import React

@objc(PushEngageReactNative)
public class PushEngageReactNative: NSObject {

    // Cold-boot replay: see MessageBuffer.swift for the rationale.
    let buffer = MessageBuffer()

    @objc public override init() {
        super.init()
        // Auto-report wrapper attribution so the backend tags this subscriber
        // as an RN client without consumers having to do it manually.
        PushEngage.setPlatform("react-native")
        PushEngage.setWrapperVersion(PushEngageReactNative.wrapperVersion)
        PushEngage.setNotificationOpenHandler { [weak self] (result) in
            guard let self = self else { return }
            let additionalData: [String: String]? = result.notification.additionalData
            //Deeplink - trigger
            let deeplink = result.notificationAction.actionID
            let arguments: [String: Any] = [
                "deepLink": deeplink as Any, "data": additionalData as Any,
            ]
            self.buffer.deliver(arguments)
        }
    }

    // Bridge version — kept in sync with the npm package version via the
    // package.json bump. Reported to the backend via setWrapperVersion and
    // returned from getSdkVersion below.
    @objc public static let wrapperVersion: String = "1.1.0"

    @objc public func setCallback(callback: @escaping ([String: Any]) -> Void) {
        buffer.setCallback(callback)
    }

    @objc func triggerCallback(message: [String: Any]) {
        buffer.deliver(message)
    }

    // In-app message custom-action forwarding. No MessageBuffer-style replay
    // is needed here: custom actions only fire on user taps inside a
    // displayed message, which cannot happen before the .mm init wires this
    // callback (same call stack as module creation).
    private var iamCustomActionCallback: (([String: Any]) -> Void)?
    private var iamCustomActionForwardingEnabled = false
    private var iamCustomActionHandlerRegistered = false

    @objc public func setIAMCustomActionCallback(
        callback: @escaping ([String: Any]) -> Void
    ) {
        iamCustomActionCallback = callback
    }

    @objc public func setIAMCustomActionHandlerEnabled(_ enabled: Bool) {
        iamCustomActionForwardingEnabled = enabled
        // The SDK handler setter takes a non-optional closure, so it can't be
        // unregistered — register once and gate forwarding on the flag.
        guard enabled, !iamCustomActionHandlerRegistered else { return }
        iamCustomActionHandlerRegistered = true
        PushEngage.setIAMCustomActionHandler { [weak self] actionId, parameters in
            guard let self = self, self.iamCustomActionForwardingEnabled else { return }
            self.iamCustomActionCallback?([
                "actionId": actionId,
                "parameters": parameters,
            ])
        }
    }

    @objc public func triggerIAMEvent(
        _ eventName: String, parameters: [String: Any]?,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        // Mirrors the Android module's guard so the same JS call fails the same
        // way on both platforms; the native SDKs reject this too.
        if eventName.isEmpty {
            reject("400", "Event name is required", nil)
            return
        }
        PushEngage.triggerIAMEvent(eventName: eventName, parameters: parameters) {
            response, error in
            if let error = error {
                reject("TRIGGER_IN_APP_EVENT_ERROR", error.localizedDescription, error)
            } else if response {
                resolve("In-app message event triggered successfully")
            } else {
                reject(
                    "TRIGGER_IN_APP_EVENT_FAILED", "Failed to trigger in-app message event",
                    nil)
            }
        }
    }

    @objc public func addAlert(
        _ alert: [String: Any], resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let typeString = alert["type"] as? String,
            let productId = alert["productId"] as? String,
            let link = alert["link"] as? String,
            let price = alert["price"] as? Double
        else {
            reject("MISSING_ARGUMENTS", "Missing required arguments", nil)
            return
        }
        let expiryTimestampDate = Iso8601DateParser.parse(alert["expiryTimestamp"] as? String)
        let availability = TriggerAlertAvailabilityMapper.map(alert["availability"] as? String)

        let triggerAlert = TriggerAlert(
            type: TriggerAlertTypeMapper.map(typeString),
            productId: productId,
            link: link,
            price: price,
            variantId: alert["variantId"] as? String,
            expiryTimestamp: expiryTimestampDate,
            alertPrice: alert["alertPrice"] as? Double,
            availability: availability,
            profileId: alert["profileId"] as? String,
            mrp: alert["mrp"] as? Double,
            data: alert["data"] as? [String: String])

        PushEngage.addAlert(triggerAlert: triggerAlert) { response, error in
            if response {
                resolve("Alert added successfully")
            } else {
                reject("FAILURE", "Alert sending failed", nil)
            }
        }
    }

    @objc public func addDynamicSegment(
        _ segments: [Any], resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let segments = segments as? [[String: Any]] else {
            reject("INVALID_ARGUMENT", "Missing required arguments", nil)
            return
        }
        PushEngage.addDynamicSegments(segments) { response, error in
            if response {
                resolve("Subscriber added to dynamic segment successfully")
            } else {
                reject("FAILURE", "Failed to add subscriber to dynamic segment(s)", nil)
            }
        }
    }

    @objc public func addProfileId(
        _ profileId: String, resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {

        PushEngage.addProfile(for: profileId) { response, error in
            if response {
                resolve("Profile Id added successfully")
            } else {
                reject("FAILURE", "Failed to add profile Id", nil)
            }
        }
    }

    @objc public func addSegment(
        _ segments: [Any], resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let segments = segments as? [String] else {
            reject("INVALID_ARGUMENT", "Missing required arguments", nil)
            return
        }
        PushEngage.addSegments(segments) { response, error in
            if response {
                resolve("Subscriber added to segment(s) successfully")
            } else {
                reject("FAILURE", "Failed to add subscriber to segment", nil)
            }
        }
    }

    @objc public func addSubscriberAttributes(
        _ attributes: [String: Any], resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        PushEngage.add(attributes: attributes) { response, error in
            if response {
                resolve("Subscriber attribute(s) added successfully")
            } else {
                reject("FAILURE", "Failed to add subscriber attribute(s)", nil)
            }
        }
    }

    @objc public func automatedNotification(
        _ status: Bool, resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        PushEngage.automatedNotification(status: AutomatedNotificationStatusMapper.map(status)) { response, error in
            if response {
                resolve(
                    "Automated notification " + (status ? "enabled" : "disabled") + " successfully")
            } else {
                reject("FAILURE", "Trigger enabled failed", nil)
            }
        }
    }

    @objc public func deleteSubscriberAttributes(
        _ attributes: [Any], resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let attributes = attributes as? [String] else {
            reject("INVALID_ARGUMENT", "Missing required arguments", nil)
            return
        }
        PushEngage.deleteSubscriberAttributes(for: attributes) { response, error in
            if response {
                resolve("Subscriber attribute(s) deleted successfully")
            } else {
                reject("FAILURE", "Failed to delete subscriber attribute(s)", nil)
            }
        }
    }

    @objc public func enableLogging(_ shouldEnable: Bool) {
        PushEngage.enableLogging = shouldEnable
    }

    @objc public func setBadgeCount(_ count: Double) {
        PushEngage.setBadgeCount(count: BadgeCountCoercion.fromDouble(count))
    }

    @objc public func getDeviceTokenHash(
        resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock
    ) {
        // No public iOS SDK accessor for this yet; resolve nil so JS gets a
        // value consistent with the Promise<string | null> spec and matches
        // Android's behavior when the SDK has no hash to return.
        resolve(nil)
    }

    @objc public func getSdkVersion() -> String {
        return PushEngageReactNative.wrapperVersion
    }

    @objc public func getSubscriberAttributes(
        resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock
    ) {
        PushEngage.getSubscriberAttributes { info, error in
            if let info {
                resolve(info)
            } else {
                reject("FAILURE", "Failed to retrieve subscriber attributes", nil)
            }
        }
    }

    @objc public func getSubscriberDetails(
        _ values: [Any]?, resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let values = values as? [String] else {
            reject("INVALID_ARGUMENT", "Missing required arguments", nil)
            return
        }

        PushEngage.getSubscriberDetails(for: values) { response, error in
            if let value = response {
                // iOS SDK 0.1.0 changed SubscriberDetailsData to a dynamic
                // [String: Any] keyed by snake_case wire names — already the
                // shape we want to send to JS, no JSONEncoder pass needed.
                resolve(value.rawFields)
            } else {
                reject("FAILURE", "Failed retrieving subscriber details", nil)
            }
        }
    }

    @objc public func removeSegment(
        _ segments: [Any], resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let segments = segments as? [String] else {
            reject("INVALID_ARGUMENT", "Missing required arguments", nil)
            return
        }
        PushEngage.removeSegments(segments) { response, error in
            if response {
                resolve("Subscriber removed from segment(s) successfully")
            } else {
                reject("FAILURE", "Failed to remove subscriber from segment(s)", nil)
            }
        }
    }

    @objc public func requestNotificationPermission(
        resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock
    ) {
        PushEngage.requestNotificationPermission { granted, error in
            DispatchQueue.main.async {
                if let error = error {
                    reject("PERMISSION_ERROR", error.localizedDescription, error)
                } else {
                    resolve(granted)
                }
            }
        }
    }

    @objc public func getNotificationPermissionStatus() -> String {
        return PushEngage.getNotificationPermissionStatus()
    }

    @objc public func getInitialNotification(
        resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock
    ) {
        resolve(buffer.consumeInitialNotification())
    }

    @objc public func getSubscriptionStatus(
        resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock
    ) {
        PushEngage.getSubscriptionStatus { isSubscribed, error in
            DispatchQueue.main.async {
                if let error = error {
                    reject("SUBSCRIPTION_STATUS_ERROR", error.localizedDescription, error)
                } else {
                    resolve(isSubscribed)
                }
            }
        }
    }

    @objc public func getSubscriptionNotificationStatus(
        resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock
    ) {
        PushEngage.getSubscriptionNotificationStatus { canReceiveNotifications, error in
            DispatchQueue.main.async {
                if let error = error {
                    reject(
                        "SUBSCRIPTION_NOTIFICATION_STATUS_ERROR", error.localizedDescription, error)
                } else {
                    resolve(canReceiveNotifications)
                }
            }
        }
    }

    @objc public func getSubscriberId(
        resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock
    ) {
        PushEngage.getSubscriberId { response in
            DispatchQueue.main.async {
                resolve(response)
            }
        }
    }

    @objc public func unsubscribe(
        resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock
    ) {
        PushEngage.unsubscribe { success, error in
            DispatchQueue.main.async {
                if let error = error {
                    reject("UNSUBSCRIBE_ERROR", error.localizedDescription, error)
                } else if success {
                    resolve(nil)
                } else {
                    reject("UNSUBSCRIBE_FAILED", "Unsubscribe operation failed", nil)
                }
            }
        }
    }

    @objc public func subscribe(
        resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock
    ) {
        PushEngage.subscribe { success, error in
            DispatchQueue.main.async {
                if let error = error {
                    reject("SUBSCRIBE_ERROR", error.localizedDescription, error)
                } else if success {
                    resolve(nil)
                } else {
                    reject("SUBSCRIBE_FAILED", "Subscribe operation failed", nil)
                }
            }
        }
    }

    @objc public func sendGoal(
        _ goal: [String: Any], resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let name = goal["name"] as? String else {
            reject("MISSING_ARGUMENTS", "Missing required arguments", nil)
            return
        }

        let count = goal["count"] as? Int
        let value = goal["value"] as? Double

        let goal = Goal(name: name, count: count, value: value)

        PushEngage.sendGoal(goal: goal) { response, error in
            if response {
                resolve("Goal sent successfully")
            } else {
                reject("FAILURE", "Goal sending failed", nil)
            }
        }
    }

    @objc public func sendTriggerEvent(
        _ trigger: [String: Any], resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let campaignName = trigger["campaignName"] as? String,
            let eventName = trigger["eventName"] as? String
        else {
            reject("MISSING_ARGUMENTS", "Missing required arguments", nil)
            return
        }

        let referenceId = trigger["referenceId"] as? String
        let profileId = trigger["profileId"] as? String
        let data = trigger["data"] as? [String: String]

        let trigger = TriggerCampaign(
            campaignName: campaignName,
            eventName: eventName,
            referenceId: referenceId,
            profileId: profileId,
            data: data)

        PushEngage.sendTriggerEvent(triggerCampaign: trigger) { response, error in
            if response {
                resolve("Trigger sent successfully")
            } else {
                reject("FAILURE", "Trigger sending failed", nil)
            }
        }
    }

    @objc public func setAppId(_ appId: String) {
        PushEngage.setAppID(id: appId)
    }

    @objc public func setEnvironment(_ environment: String) {
        let env: PEEnvironment
        switch environment.uppercased() {
        case "STAGING", "STG":
            env = .staging
        default:
            env = .production
        }
        PushEngage.setEnvironment(environment: env)
    }

    @objc public func setSmallIconResource(
        _ resourceName: String, resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        // Android-only API; iOS notifications don't use a separately
        // settable small-icon drawable. Resolve nil to match the
        // Promise<void> spec and Android's resolution value.
        resolve(nil)
    }

    @objc public func setSubscriberAttributes(
        _ attributes: [String: Any], resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {

        PushEngage.set(attributes: attributes) { response, error in
            if response {
                resolve("Subscriber attribute(s) set successfully")
            } else {
                reject("FAILURE", "Failed to set subscriber attribute(s)", nil)
            }
        }
    }

    @objc public func identify(
        _ fields: [String: Any], resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        PushEngage.identify(fields: fields) { success, error in
            DispatchQueue.main.async {
                if let error = error {
                    reject("IDENTIFY_ERROR", error.localizedDescription, error)
                } else if success {
                    resolve(nil)
                } else {
                    reject("IDENTIFY_FAILED", "Identify failed", nil)
                }
            }
        }
    }

    @objc public func logout(
        _ fieldNames: [Any]?, resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        let names = fieldNames as? [String]
        PushEngage.logout(fieldNames: names) { success, error in
            DispatchQueue.main.async {
                if let error = error {
                    reject("LOGOUT_ERROR", error.localizedDescription, error)
                } else if success {
                    resolve(nil)
                } else {
                    reject("LOGOUT_FAILED", "Logout failed", nil)
                }
            }
        }
    }

    @objc public func trackEvent(
        _ event: [String: Any], resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let eventName = event["eventName"] as? String, !eventName.isEmpty else {
            reject("MISSING_ARGUMENTS", "Missing required eventName", nil)
            return
        }
        let properties = event["data"] as? [String: Any]
        let profileId = event["profileId"] as? String
        let provider = event["provider"] as? String
        let eventType = event["eventType"] as? String

        PushEngage.trackEvent(
            name: eventName,
            properties: properties,
            profileId: profileId,
            provider: provider,
            eventType: eventType
        ) { success, error in
            DispatchQueue.main.async {
                if let error = error {
                    reject("TRACK_EVENT_ERROR", error.localizedDescription, error)
                } else if success {
                    resolve(nil)
                } else {
                    reject("TRACK_EVENT_FAILED", "Track event failed", nil)
                }
            }
        }
    }

    @objc public func runConfigValidation(
        _ senderId: String, projectId: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        // iOS does not have an FCM config validation surface; the only
        // analogue (APNS entitlement checks) is enforced by the OS at
        // notification-registration time. Resolve true so shared JS code can
        // call this unconditionally without a Platform.OS guard.
        resolve(true)
    }

    @objc public func setFcmConfigErrorListenerEnabled(_ enabled: Bool) {
        // No-op on iOS — FCM is Android-only.
    }
}
