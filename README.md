<p align="center">
  <a href="https://www.pushengage.com">
    <img src="https://assetscdn.pushengage.com/site_assets/img/pushengage-logo.png" width="300" alt="PushEngage"/>
  </a>
</p>

<p align="center">
  <strong>React Native Push Notification SDK</strong><br/>
  Add cross-platform push notifications to your React Native app.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@pushengage/pushengage-react-native"><img src="https://img.shields.io/npm/v/@pushengage/pushengage-react-native.svg?style=flat-square" alt="npm version"/></a>
  <a href="https://www.npmjs.com/package/@pushengage/pushengage-react-native"><img src="https://img.shields.io/npm/dm/@pushengage/pushengage-react-native.svg?style=flat-square" alt="npm downloads"/></a>
  <a href="#"><img src="https://img.shields.io/badge/platform-Android%20%7C%20iOS-blue.svg?style=flat-square" alt="Platform"/></a>
  <a href="#"><img src="https://img.shields.io/badge/React%20Native-%3E%3D%200.78-61dafb.svg?style=flat-square" alt="React Native"/></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg?style=flat-square" alt="License"/></a>
</p>

---

## Why PushEngage?

PushEngage is a complete push notification platform that supports **web and mobile** from a single
dashboard. Unlike wiring up Firebase Cloud Messaging and APNs yourself, PushEngage gives you a full
marketing toolkit on top of reliable cross-platform delivery: audience segmentation, automated drip
campaigns, A/B testing, analytics, and a no-code campaign builder.

**Key features of the React Native SDK:**

- **Cross-Platform** -- single API for both Android and iOS
- **TypeScript Support** -- fully typed with TypeScript definitions
- **Rich Notifications** -- images, action buttons, custom sounds
- **Deep Linking** -- route users to specific screens via `onValueChanged` callback
- **Cold-Boot Taps** -- capture the notification an app was launched from via
  `getInitialNotification`
- **Audience Segmentation** -- static and dynamic segments based on user behavior
- **Triggered Campaigns** -- send notifications based on in-app events
- **Goal Tracking** -- measure conversions tied to notifications
- **Price Drop & Inventory Alerts** -- e-commerce trigger notifications
- **In-App Messaging** -- dashboard-configured in-app messages with custom trigger events and
  `onIAMCustomAction` callbacks
- **Subscriber Attributes** -- store custom key-value data per subscriber
- **New Architecture Ready** -- supports React Native's Turbo Modules

---

## Installation

```bash
npm install @pushengage/pushengage-react-native
# or
yarn add @pushengage/pushengage-react-native
```

For iOS, install the native pods:

```bash
cd ios && pod install
```

> **Prerequisites:** Firebase project (Android) + Apple Developer account (iOS). See the
> [Getting Started Guide](https://www.pushengage.com/documentation/setting-up-react-native-app-push-notification-using-pushengage/)
> for platform-specific setup.

---

## Quick Start

### 1. Initialize the SDK

```tsx
import PushEngage from '@pushengage/pushengage-react-native'

// In your app initialization
PushEngage.setAppId('YOUR_APP_ID')
```

### 2. Request Permission & Subscribe

```tsx
const granted = await PushEngage.requestNotificationPermission()
if (granted) {
  await PushEngage.subscribe()
  console.log('Subscribed successfully')
}
```

### 3. Handle Deep Links & Cold-Boot Taps

```tsx
// Runtime taps (app in foreground or background)
PushEngage.onValueChanged(data => {
  console.log('Notification data:', data)
  // Navigate to the appropriate screen based on data
})

// Cold-boot tap (app launched from a terminated state) — call once on startup.
// On iOS this returns the launch notification and then drains (subsequent calls
// return null). On Android it resolves null, since cold-boot launches are
// delivered through the standard deep-link intent.
const initial = await PushEngage.getInitialNotification()
if (initial) {
  // Navigate based on initial.deepLink / initial.data
}
```

### 4. Send a Goal Event

```tsx
await PushEngage.sendGoal({
  name: 'purchase_complete',
  count: 1,
  value: 49.99
})
```

### 5. In-App Messaging

In-app messages are configured on the PushEngage dashboard and sync to the device automatically once
`setAppId` is set — no push subscription or notification permission required. Fire a trigger event
to display campaigns configured with a matching custom trigger:

```tsx
// Parameters are optional and used for additional targeting. Values are
// compared as strings after native stringification (2 matches "2").
await PushEngage.triggerIAMEvent('onboarding_complete', {
  step: 'finished'
})
```

Message action buttons of type `open_url`, `dismiss`, and `request_notification_permission` are
handled by the SDK. Buttons configured with a `custom` action reach your JS code through
`onIAMCustomAction`:

```tsx
const subscription = PushEngage.onIAMCustomAction(({ actionId, parameters }) => {
  // parameters.action is the "Action name" entered for the button on the
  // dashboard — route on it. actionId is the button's internal key (e.g.
  // "t04B05"), generated by the dashboard; don't route on it.
  switch (parameters.action) {
    case 'open_offers':
      // navigate to your offers screen
      break
  }
})
// Later: subscription.remove()
```

> **Android 13+ note:** if your campaigns use the `request_notification_permission` action, no
> host-app code is required. The SDK requests the permission through its own fragment (on
> `ComponentActivity` hosts) or an invisible helper activity, receives the system result itself, and
> subscribes the user automatically on grant — do **not** forward `onRequestPermissionsResult` to
> the SDK.

---

## API Overview

| Category             | Methods                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Setup**            | `setAppId`, `setEnvironment`, `getSdkVersion`, `setSmallIconResource`, `enableLogging`, `runConfigValidation` |
| **Permissions**      | `requestNotificationPermission`, `getNotificationPermissionStatus`                                            |
| **Subscription**     | `subscribe`, `unsubscribe`, `getSubscriptionStatus`, `getSubscriptionNotificationStatus`                      |
| **Subscriber Data**  | `getSubscriberId`, `getSubscriberDetails`, `getDeviceTokenHash`                                               |
| **Identity**         | `identify`, `logout`, `addProfileId`                                                                          |
| **Attributes**       | `addSubscriberAttributes`, `setSubscriberAttributes`, `getSubscriberAttributes`, `deleteSubscriberAttributes` |
| **Segments**         | `addSegment`, `removeSegment`, `addDynamicSegment`                                                            |
| **Events**           | `sendTriggerEvent`, `sendGoal`, `trackEvent`, `addAlert`                                                      |
| **Campaigns**        | `automatedNotification` (enable/disable)                                                                      |
| **In-App Messaging** | `triggerIAMEvent`                                                                                             |
| **Notifications**    | `setBadgeCount`, `getInitialNotification` (cold-boot)                                                         |
| **Listeners**        | `onValueChanged` (deep link / notification data), `onFcmConfigError`, `onIAMCustomAction`                     |

Full API reference:
[React Native SDK Public APIs](https://pushengage.com/api/mobile-sdk/react-native-sdk)

---

## Expo vs Bare Workflow

|                        | Bare Workflow                                                      | Expo (with dev client)                            |
| ---------------------- | ------------------------------------------------------------------ | ------------------------------------------------- |
| **Setup**              | Follow standard installation above                                 | Requires `expo-dev-client` for native modules     |
| **Firebase Config**    | Place `google-services.json` / `GoogleService-Info.plist` directly | Place config files manually after `expo prebuild` |
| **Native Code Access** | Full access to `ios/` and `android/`                               | Access via custom dev client build                |
| **Recommended For**    | Production apps needing full control                               | Teams already using Expo ecosystem                |

> **Note:** Expo Go does not support custom native modules. You must use a
> [development build](https://docs.expo.dev/develop/development-builds/introduction/) to test
> PushEngage with Expo.

---

## Example Project

The **`example/`** directory contains a complete React Native app demonstrating:

- Push notification setup and permission handling
- Subscription and subscriber details
- Trigger campaigns
- Alert entries (price drop / inventory)
- Goal tracking
- In-app messaging (trigger events, custom-action logging, database-state viewer)
- Cold-boot notification capture and badge management

To run the example:

```bash
cd example
yarn install
# iOS
cd ios && pod install && cd ..
yarn ios
# Android
yarn android
```

---

## Documentation

- [Getting Started Guide](https://www.pushengage.com/documentation/setting-up-react-native-app-push-notification-using-pushengage/)
  -- step-by-step setup for Android and iOS
- [React Native SDK API Reference](https://pushengage.com/api/mobile-sdk/react-native-sdk) --
  complete API docs
- [PushEngage Dashboard](https://app.pushengage.com) -- manage campaigns and analytics

---

## Requirements

| Requirement  | Minimum            |
| ------------ | ------------------ |
| React Native | 0.78+              |
| iOS          | 15.1+              |
| Android      | 5.0+ (API 21)      |
| Node.js      | 18+                |
| Firebase     | Required (Android) |
| APNs         | Required (iOS)     |

---

## Support

Having trouble? We're here to help.

- **Issues & Bugs** --
  [Open a GitHub issue](https://github.com/awesomemotive/pushengage-react-native/issues)
- **General Support** -- Contact us from your [PushEngage dashboard](https://app.pushengage.com) or
  email [care@pushengage.com](mailto:care@pushengage.com)

---

## License

MIT -- see [LICENSE](LICENSE) for details.
