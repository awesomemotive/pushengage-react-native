import { TurboModuleRegistry, type TurboModule } from 'react-native';
import type { EventEmitter } from 'react-native/Libraries/Types/CodegenTypes';

/**
 * Interface defining the native module specification for PushEngage React Native SDK.
 */
export interface Spec extends TurboModule {
  /**
   * Event emitter for value changes.
   */
  readonly onValueChanged: EventEmitter<{
    deepLink: string;
    data: { [key: string]: string };
  }>;

  /**
   * **Android only.** Never fires on iOS — that platform has no FCM surface.
   *
   * Event emitter for FCM config validation errors. Fires when the local
   * Firebase configuration does not match the dashboard-side
   * `firebase_sender_id` / `firebase_project_id`, or when the token fetch
   * fails with a bad-config status. Codes:
   *   5001 — FCM_SENDER_ID_MISMATCH
   *   5002 — FCM_PROJECT_ID_MISMATCH
   *   5003 — FCM_LOCAL_CONFIG_INVALID
   *
   * Native forwarding is enabled automatically on module load — subscribe
   * directly via `PushEngage.onFcmConfigError(callback)`. Call
   * `subscription.remove()` to unsubscribe.
   */
  readonly onFcmConfigError: EventEmitter<{
    code: number;
    message: string;
  }>;

  /**
   * Internal. Toggles the native FCM config error forwarder that broadcasts
   * to the `onFcmConfigError` EventEmitter. Auto-enabled by `index.tsx` on
   * module load; not exposed on the public `PushEngage` object.
   *
   * @param enabled - Whether the native listener should forward to JS.
   */
  setFcmConfigErrorListenerEnabled: (enabled: boolean) => void;

  /**
   * Sets the application ID for PushEngage.
   *
   * @param appId - The application ID to be set.
   */
  setAppId: (appId: string) => void;

  /**
   * Switches the SDK between PushEngage's staging and production backends.
   *
   * **Call this before `setAppId`** — both platforms cache the base URLs on
   * builder init.
   *
   * @param environment - Either `"STAGING"` or `"PRODUCTION"` (case
   * insensitive). Unknown values default to production.
   */
  setEnvironment: (environment: string) => void;

  /**
   * Returns the current version of the SDK.
   *
   * @returns A string representing the SDK version.
   */
  getSdkVersion: () => string;

  /**
   * **Android only.** On iOS resolves with `null` as a no-op so cross-platform
   * JS code can call it unconditionally.
   *
   * Sets the small icon resource for notifications on Android.
   *
   * @param resourceName - The name of the drawable resource to be used as small icon.
   */
  setSmallIconResource: (resourceName: string) => Promise<void>;

  /**
   * Retrieves the device token hash.
   *
   * @returns A promise that resolves to the device token hash string or null if not available.
   */
  getDeviceTokenHash: () => Promise<string | null>;

  /**
   * Enables or disables logging for the PushEngage SDK.
   *
   * @param shouldEnable - Boolean indicating whether logging should be enabled.
   */
  enableLogging: (shouldEnable: boolean) => void;

  /**
   * Updates trigger campaign status.
   *
   * @param status - Boolean indicating whether automated notifications should be enabled.
   * @returns Promise resolving to result string or null.
   */
  automatedNotification: (status: boolean) => Promise<string | null>;

  /**
   * Sends a trigger event for a specific campaign.
   *
   * @param trigger - Object containing trigger event data.
   * @returns Promise resolving to result string or null.
   */
  sendTriggerEvent: (trigger: {
    [key: string]: string;
  }) => Promise<string | null>;

  /**
   * Sends a goal event.
   *
   * @param goal - Object containing goal data.
   * @returns Promise resolving to result string or null.
   */
  sendGoal: (goal: {
    [key: string]: string | number;
  }) => Promise<string | null>;

  /**
   * Adds an alert to be triggered.
   *
   * The `expiryTimestamp` field, if provided, must be an ISO 8601 UTC string
   * in the exact form produced by `Date.prototype.toISOString()` —
   * `YYYY-MM-DDTHH:mm:ss.sssZ` (the `Z` may be replaced with an offset such
   * as `+05:30`). Both fractional seconds and the timezone designator are
   * required; anything else is rejected on both iOS and Android. Example:
   * `new Date(Date.now() + 86400000).toISOString()`.
   *
   * @param alert - Object containing alert data.
   * @returns Promise resolving to result string or null.
   */
  addAlert: (alert: {
    [key: string]: string | number | undefined;
  }) => Promise<string | null>;

  /**
   * Retrieves subscriber details based on provided values.
   *
   * @param values - Array of strings specifying which details to retrieve.
   * @returns Promise resolving to subscriber details object or null.
   */
  getSubscriberDetails: (
    values: string[] | null
  ) => Promise<{ [key: string]: string | number | boolean } | null>;

  /**
   * Requests notification permission from the user.
   * For Android 13 (API 33) and above, this will show the system permission dialog.
   * For older versions, the permission is automatically granted and the promise
   * will resolve with granted=true.
   *
   * When permission is granted, the SDK automatically calls PushEngage.subscribe()
   * for you, so you don't need to call it manually.
   *
   * @returns Promise that resolves with boolean indicating if permission was granted
   * @throws Error if permission request fails
   */
  requestNotificationPermission: () => Promise<boolean>;

  /**
   * Returns the notification that opened the app from a terminated state,
   * then `null` on every subsequent call.
   *
   * On iOS this is the only reliable way to recover a tap that launched the
   * app from a force-quit state — that delivery happens before JS can
   * subscribe to `onValueChanged`, so it is not observable through the
   * event listener. Skipping this call on startup will silently drop those
   * taps. Pair it with `onValueChanged` for runtime taps; the cold-boot tap
   * is routed exclusively to this pull API and never replayed through
   * `onValueChanged`, so the same payload cannot arrive on both channels.
   *
   * On Android the launch URL arrives through standard deep-link routing
   * (handled by the host activity's intent filter), so this resolves to
   * `null` — it exists for cross-platform JS code parity.
   *
   * @returns Promise resolving to `{ deepLink, data }` or `null`.
   */
  getInitialNotification: () => Promise<{
    deepLink: string;
    data: { [key: string]: string };
  } | null>;

  /**
   * Get the current notification permission status.
   *
   * Use this method to retrieve the current notification permission status for
   * the application. This method returns the permission status synchronously as a string.
   *
   * @returns A string indicating the current notification permission state:
   *          - "granted": The application is authorized to post user notifications
   *          - "denied": The application is not authorized to post user notifications
   *          - "notYetRequested": (iOS only) The user has not yet made a choice regarding notification permissions
   */
  getNotificationPermissionStatus: () => string;

  /**
   * Get the current subscription status for push notifications.
   *
   * This method checks if the user is subscribed to the push notification service.
   *
   * @returns Promise that resolves with boolean indicating if user is subscribed
   * @throws Error if the subscription status check fails
   */
  getSubscriptionStatus: () => Promise<boolean>;

  /**
   * Get the current subscription notification status.
   *
   * This method checks if the user is both subscribed to push notifications AND
   * has system notification permission granted. This represents the complete
   * ability to receive push notifications.
   *
   * @returns Promise that resolves with boolean indicating if user can receive notifications
   * @throws Error if the status check fails
   */
  getSubscriptionNotificationStatus: () => Promise<boolean>;

  /**
   * Get Subscriber ID.
   *
   * Use this method to retrieve the unique subscriber ID for a user. PushEngage
   * generates this ID for every user based on their subscription data. Sometimes,
   * this ID is referred to as the 'subscriber_hash'. The subscriber ID remains
   * consistent unless there's a change in the user's subscription.
   *
   * @returns Promise that resolves with subscriber ID string or null if not available
   * @throws Error if the operation fails
   */
  getSubscriberId: () => Promise<string | null>;

  /**
   * Manually unsubscribe the user from push notifications.
   *
   * This method unsubscribes the user from receiving push notifications while
   * preserving their subscription record. The user can be re-subscribed later
   * using the subscribe() method.
   *
   * @returns Promise that resolves when unsubscribe operation completes successfully
   * @throws Error if the unsubscribe operation fails
   */
  unsubscribe: () => Promise<void>;

  /**
   * Manually subscribe the user to push notifications.
   *
   * This method subscribes the user to push notifications. The implementation
   * matches iOS logic for cross-platform consistency. It checks permission status
   * and subscriber hash to determine the appropriate action.
   *
   * @returns Promise that resolves when subscribe operation completes successfully
   * @throws Error if the subscribe operation fails
   */
  subscribe: () => Promise<void>;

  /**
   * Retrieves the attributes of a subscriber.
   *
   * @returns Promise resolving to subscriber attributes or null.
   */
  getSubscriberAttributes: () => Promise<{
    [key: string]: string | number | boolean;
  } | null>;

  /**
   * Adds subscriber to segments.
   *
   * @param segments - Array of segment names to be added.
   * @returns Promise resolving to result string or null.
   */
  addSegment: (segments: string[]) => Promise<string | null>;

  /**
   * Removes segments from subscriber.
   *
   * @param segments - Array of segment names to be removed.
   * @returns Promise resolving to result string or null.
   */
  removeSegment: (segments: string[]) => Promise<string | null>;

  /**
   * Adds subscriber to dynamic segments.
   *
   * @param segments - Array of dynamic segment objects with name (string) and duration (number).
   * @returns Promise resolving to result string or null.
   * @example
   * ```typescript
   * const segments = [
   *   { name: 'premium_users', duration: 30 },
   *   { name: 'mobile_users', duration: 7 }
   * ];
   * await PushEngage.addDynamicSegment(segments);
   * ```
   */
  addDynamicSegment: (
    segments: { name: string; duration: number }[]
  ) => Promise<string | null>;

  /**
   * Updates attributes of a subscriber.
   * If an attribute exists, it will be replaced.
   *
   * @param attributes - Key-value pairs of attributes.
   * @returns Promise resolving to result string or null.
   */
  addSubscriberAttributes: (attributes: {
    [key: string]: string;
  }) => Promise<string | null>;

  /**
   * Deletes subscriber attributes.
   *
   * @param attributes - Array of attribute names to delete.
   * @returns Promise resolving to result string or null.
   */
  deleteSubscriberAttributes: (attributes: string[]) => Promise<string | null>;

  /**
   * Associates a profile ID with the subscriber.
   *
   * @param profileId - The profile ID to be added.
   * @returns Promise resolving to result string or null.
   */
  addProfileId: (profileId: string) => Promise<string | null>;

  /**
   * Sets subscriber attributes, replacing any existing attributes.
   *
   * @param attributes - Key-value pairs of attributes.
   * @returns Promise resolving to result string or null.
   */
  setSubscriberAttributes: (attributes: {
    [key: string]: string;
  }) => Promise<string | null>;

  /**
   * Sets the application icon badge count.
   *
   * On iOS uses UNUserNotificationCenter.setBadgeCount (iOS 16+) with
   * applicationIconBadgeNumber fallback. On Android, sets the badge number on
   * subsequent notifications via the notification builder. Pass 0 to clear.
   *
   * @param count - The badge count to display. Pass 0 to clear.
   */
  setBadgeCount: (count: number) => void;

  /**
   * Identifies the current subscriber with up to 12 predefined fields.
   *
   * Valid keys: `first_name`, `last_name`, `email`, `phone`, `gender`, `dob`,
   * `language`, `profile_id`, `country`, `city`, `state`, `zip`. Values must
   * be string, number, or boolean. Mirrors the Web SDK
   * `identify(subscriberFields)` API.
   *
   * Calls with an identical payload short-circuit locally and resolve without
   * hitting the network (iOS additionally bounds the cache to a 24h TTL).
   *
   * @param fields - Subscriber fields to upsert.
   * @returns Promise that resolves when identify completes.
   * @throws Error if validation or the network call fails.
   */
  identify: (fields: {
    [key: string]: string | number | boolean;
  }) => Promise<void>;

  /**
   * Removes subscriber fields previously set via `identify`.
   *
   * `null` or an empty array defaults to the PII set
   * `[first_name, last_name, email, phone, gender, dob, profile_id]`,
   * matching the Web SDK logout fallback.
   *
   * @param fieldNames - Field names to remove, or null for the default PII set.
   * @returns Promise that resolves when logout completes.
   * @throws Error if validation or the network call fails.
   */
  logout: (fieldNames: string[] | null) => Promise<void>;

  /**
   * Records a custom analytics event.
   *
   * @param event - Event payload. Keys:
   *   `eventName` (string, required) — the event name.
   *   `data` (object, optional) — string/number/boolean values.
   *   `profileId` (string, optional) — subscriber profile id.
   *   `provider` (string, optional) — defaults to "PushEngage".
   *   `eventType` (string, optional) — defaults to "PushEngage.CustomEvent".
   * @returns Promise that resolves when the event has been recorded.
   */
  trackEvent: (event: {
    [key: string]:
      | string
      | { [key: string]: string | number | boolean }
      | undefined;
  }) => Promise<void>;

  /**
   * **Android only.** No-op on iOS — resolves to `true` so cross-platform
   * JS code can call it unconditionally.
   *
   * Validates the local Firebase configuration against the supplied
   * sender id / project id.
   *
   * @param senderId - Server-issued Firebase sender id to validate against.
   * @param projectId - Server-issued Firebase project id to validate against.
   * @returns Promise that resolves to true if the config matches.
   */
  runConfigValidation: (
    senderId: string,
    projectId: string
  ) => Promise<boolean>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('PushengageReactNative');
