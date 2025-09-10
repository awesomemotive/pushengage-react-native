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
   * Sets the application ID for PushEngage.
   *
   * @param appId - The application ID to be set.
   */
  setAppId: (appId: string) => void;

  /**
   * Returns the current version of the SDK.
   *
   * @returns A string representing the SDK version.
   */
  getSdkVersion: () => string;

  /**
   * Sets the small icon resource for notifications on Android.
   * This method is only applicable for Android platforms.
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
}

export default TurboModuleRegistry.getEnforcing<Spec>('PushengageReactNative');
