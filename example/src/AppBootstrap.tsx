import PushEngage from '@pushengage/pushengage-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import { DEFAULT_APP_ID, DemoPrefs } from './DemoPrefs';

// Wraps the navigator so we can read the persisted app id from AsyncStorage
// before the rest of the app runs. The native SDK initializes lazily on
// setAppId, so we want this in place before any screen calls into PushEngage.
const AppBootstrap = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [appId, environment] = await Promise.all([
        DemoPrefs.getAppId(),
        DemoPrefs.getEnvironment(),
      ]);
      // setEnvironment must run BEFORE setAppId on Android because base URLs
      // are cached on Builder.build().
      PushEngage.setEnvironment(environment);
      if (appId !== DEFAULT_APP_ID) {
        PushEngage.setAppId(appId);
      }
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color='#224ADB' size='large' />
        <Text style={styles.label}>Loading…</Text>
      </View>
    );
  }

  return <AppNavigator />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  label: { marginTop: 12, color: '#666' },
});

export default AppBootstrap;
