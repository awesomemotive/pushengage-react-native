import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import PushEngage from '@pushengage/pushengage-react-native';
import AppBootstrap from './src/AppBootstrap';

// Logging is safe to enable synchronously; the SDK keeps the flag in a
// process-wide constant and does not require an app id.
PushEngage.enableLogging(true);

// setAppId is intentionally NOT called here. AppBootstrap reads the persisted
// app id from DemoPrefs and calls setAppId before rendering the navigator.
AppRegistry.registerComponent(appName, () => AppBootstrap);
