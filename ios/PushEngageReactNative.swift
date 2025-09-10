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

    var callback: (([String: Any]) -> Void)?

    @objc public override init() {
        super.init()
        PushEngage.setNotificationOpenHandler { (result) in
            let additionalData: [String: String]? = result.notification.additionalData
            //Deeplink - trigger
            let deeplink = result.notificationAction.actionID
            let arguments: [String: Any] = [
                "deepLink": deeplink as Any, "data": additionalData as Any,
            ]
            self.callback?(arguments)
        }
    }

    @objc public func setCallback(callback: @escaping ([String: Any]) -> Void) {
        self.callback = callback
    }

    @objc func triggerCallback(message: [String: Any]) {
        callback?(message)
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
        var expiryTimestampDate: Date?
        if let expiryTimestamp = alert["expiryTimestamp"] as? String {
            expiryTimestampDate = ISO8601DateFormatter().date(from: expiryTimestamp)
        }
        var availability: TriggerAlertAvailabilityType?
        if let availabilityString = alert["availability"] as? String {
            if availabilityString == "inStock" {
                availability = .inStock
            } else if availabilityString == "outOfStock" {
                availability = .outOfStock
            }
        }

        let triggerAlert = TriggerAlert(
            type: (typeString == "priceDrop")
                ? TriggerAlertType.priceDrop : TriggerAlertType.inventory,
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
        PushEngage.automatedNotification(status: status ? .enabled : .disabled) { response, error in
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

    @objc public func getDeviceTokenHash(
        resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock
    ) {
        resolve("")
    }

    @objc public func getSdkVersion() -> String {
        return "0.0.3"
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
                let encoder = JSONEncoder()
                encoder.keyEncodingStrategy = .convertToSnakeCase
                do {
                    let jsonData = try encoder.encode(value)
                    if let jsonObject = try JSONSerialization.jsonObject(
                        with: jsonData, options: []) as? [String: Any]
                    {
                        resolve(jsonObject)
                    } else {
                        reject("FAILURE", "Failed converting JSON to dictionary", nil)
                    }
                } catch {
                    reject("FAILURE", "Failed decoding subscriber details", nil)
                }
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

    @objc public func setSmallIconResource(
        _ resourceName: String, resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        resolve("")
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
}
