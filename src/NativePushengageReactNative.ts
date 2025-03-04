import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
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
  sendGoal: (goal: { [key: string]: string }) => Promise<string | null>;

  /**
   * Adds an alert to be triggered.
   *
   * @param alert - Object containing alert data.
   * @returns Promise resolving to result string or null.
   */
  addAlert: (alert: { [key: string]: string }) => Promise<string | null>;

  /**
   * Retrieves subscriber details based on provided values.
   *
   * @param values - Array of strings specifying which details to retrieve.
   * @returns Promise resolving to subscriber details object or null.
   */
  getSubscriberDetails: (
    values: string[] | null
  ) => Promise<{ [key: string]: string } | null>;

  /**
   * Requests notification permission from the user.
   *
   * @returns Promise resolving to boolean indicating permission status.
   */
  requestNotificationPermission: () => Promise<boolean>;

  /**
   * Retrieves the attributes of a subscriber.
   *
   * @returns Promise resolving to subscriber attributes or null.
   */
  getSubscriberAttributes: () => Promise<{ [key: string]: string } | null>;

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
   * @param segments - Array of dynamic segment objects.
   * @returns Promise resolving to result string or null.
   */
  addDynamicSegment: (
    segments: { [key: string]: string }[]
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
