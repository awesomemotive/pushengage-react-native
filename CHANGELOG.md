# Changelog

All notable changes to `@pushengage/pushengage-react-native` are documented here.

## [1.1.0]

Adds In-App Messaging and raises the minimum iOS version to 15.0.

### Minimum iOS raised to 15.0

This release pins the native iOS SDK **1.1.0**, which requires **iOS 15.0** (was 12.0). React Native
itself already requires iOS 15.1 on every version this package supports (React Native >= 0.78), so
apps on a supported React Native version need no change. Apps that must still support an older iOS
should stay on an earlier version of this package — older releases remain available but do not
receive In-App Messaging or later features. The Android minimum is unchanged.

### Added

- **In-App Messaging.** Campaigns are fetched from the dashboard, stored locally and shown inside
  the app, with no push subscription or notification permission required.
  - `triggerIAMEvent(eventName, parameters?)` — show event-driven campaigns. Parameters accept
    strings, numbers and booleans; values are stringified natively before trigger matching, so `2`
    matches a condition authored as `"2"`.
  - `onIAMCustomAction(callback)` — receive an `IAMCustomAction` (`actionId` plus string
    `parameters`) when the user taps a `custom`-type button. Route on `parameters.action` (the
    button's Action name on the dashboard); `actionId` is a dashboard-generated internal key.
    Buttons also support `open_url` (http/https only, opened externally), `dismiss` and
    `request_notification_permission`.
  - Audience targeting over device and subscriber-backed fields, per-campaign date windows,
    `one_time` / `capped` / `recurring` frequency caps, four display positions (`top`, `bottom`,
    `center`, `full`) with a priority queue, and impression/click analytics queued offline.

### Changed

- Native SDK pins raised: iOS to `1.1.0`, Android to `1.0.0` (the In-App Messaging releases of
  each).

## [1.0.1]

### Fixed

- `trackEvent` no longer breaks React Native codegen during iOS New Architecture `pod install` on
  React Native >= 0.84. The spec's parameter type was adjusted so codegen resolves it cleanly;
  `trackEvent({ ... })` calls are unchanged.

## [1.0.0]

Adds cold-boot notification recovery, badge control, subscriber identification, custom event
tracking, environment switching and FCM configuration diagnostics.

### Added

- `getInitialNotification()` — pull-based API to recover the cold-boot notification tap on iOS. Call
  once on startup in addition to subscribing via `onValueChanged`. Resolves `null` on Android
  (cold-boot deep links flow through the host activity's intent filter there).
- `setBadgeCount(count)` — iOS uses `UNUserNotificationCenter.setBadgeCount` (iOS 16+) with
  `applicationIconBadgeNumber` fallback; Android sets the badge on subsequent notifications.
- `setEnvironment(environment)` — switches the SDK between `"STAGING"` and `"PRODUCTION"` backends.
  Call **before** `setAppId`.
- `identify(fields)` / `logout(fieldNames)` — subscriber identification with the 12 predefined
  fields (Web SDK parity).
- `trackEvent(event)` — custom analytics events.
- `runConfigValidation(senderId, projectId)` — Android-only Firebase config validation. iOS resolves
  `true` as a no-op.
- `onFcmConfigError` EventEmitter — Android-only FCM config error stream. Native forwarding is
  auto-enabled on module load; subscribe directly via `PushEngage.onFcmConfigError(callback)` and
  call `subscription.remove()` to unsubscribe.
- `TrackEventPayload`, `IdentifyFields`, `Environment`, `InitialNotification`, `FcmConfigError` —
  exported TypeScript types so consumers can name and reuse the public shapes (state, props,
  callback parameters, action payloads) without copying them or reaching for `ReturnType<>` helpers.

### Changed

- **Breaking (minor).** `setSmallIconResource()` on iOS now resolves with `null` instead of `""`.
  The TypeScript signature is `Promise<string | null>`. Consumers checking `if (result === "")` will
  silently skip the new resolution — update to `if (result == null)` or `if (!result)`.
- `logout(fieldNames)` now rejects with a `TypeError` at the JS boundary when `fieldNames` is an
  array containing a non-string element. Previously iOS silently fell back to the default PII set
  and Android coerced each element via `.toString()` — divergent silent behavior replaced with a
  loud failure at the JS boundary. `identify` keeps relying on native-side validation (both natives
  agree on the 12-key whitelist with identical error messages, so no wrapper-level guard is needed).
- `setFcmConfigErrorListenerEnabled` is no longer exposed on the `PushEngage` object. Native
  forwarding is now enabled automatically on module load, so the toggle has no consumer purpose. The
  native and codegen-spec methods remain for internal use.
- Native dependencies bumped to PushEngage iOS SDK 1.0.0 and PushEngage Android SDK 0.1.0. iOS 1.0.0
  splits the SDK into two pods: `PushEngage` (app target) and `PushEngageExtension` (link it in
  notification service/content extension targets).

### Fixed

- **iOS cold-boot notifications lost.** Tapping a notification while the app was force-quit silently
  dropped the deep link because `setNotificationOpenHandler` fired before JS could subscribe to the
  `onValueChanged` EventEmitter. Resolved via the new `MessageBuffer` slot/queue exposed through
  `getInitialNotification()`.
- **Android double-resume crash.** Resolved upstream in PushEngage Android SDK 0.1.0; this release
  picks up the fix.
- `setBadgeCount` no longer crashes on `NaN`, `±Infinity`, or out-of-`Int`-range values from the JS
  bridge — `BadgeCountCoercion.fromDouble` guards `isFinite` and the `Int.min/max` range, returning
  `0` (badge cleared) for invalid input.

## [0.0.3]

### Added

- `requestNotificationPermission()` — requests notification permission; resolves `Promise<boolean>`.
- `getNotificationPermissionStatus()` — current permission status (`"granted"`, `"denied"` or
  `"notYetRequested"`).
- `getSubscriptionStatus()` — whether the user is subscribed to push notifications.
- `getSubscriptionNotificationStatus()` — whether the user can receive notifications (subscribed and
  permission granted).
- `getSubscriberId()` — the subscriber ID, or `null`.
- `subscribe()` / `unsubscribe()` — subscribe or unsubscribe the user programmatically.

### Changed

- Native SDK pins raised to PushEngage iOS SDK 0.0.6 and Android SDK 0.0.6.

## [0.0.2]

### Changed

- Supports React Native 0.78.0. The `react-native` peer dependency is now `>=0.78.0`.

## [0.0.1]

Initial release.
