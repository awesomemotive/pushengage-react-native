import { AppRegistry } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { name as appName } from './app.json';
import PushEngage from '@pushengage/pushengage-react-native';

PushEngage.setAppId('YOUR_APP_ID');
PushEngage.enableLogging(true);
AppRegistry.registerComponent(appName, () => AppNavigator);
