import PushEngage from '@pushengage/pushengage-react-native';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  DEFAULT_APP_ID,
  DEFAULT_ENVIRONMENT,
  DemoPrefs,
  type DemoEnvironment,
} from './DemoPrefs';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [appId, setAppId] = useState('');
  const [environment, setEnvironment] =
    useState<DemoEnvironment>(DEFAULT_ENVIRONMENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [storedAppId, storedEnv] = await Promise.all([
        DemoPrefs.getAppId(),
        DemoPrefs.getEnvironment(),
      ]);
      setAppId(storedAppId === DEFAULT_APP_ID ? '' : storedAppId);
      setEnvironment(storedEnv);
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    const trimmed = appId.trim();
    if (trimmed.length === 0) {
      Alert.alert('Invalid app id', 'App ID cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      await DemoPrefs.setAppId(trimmed);
      await DemoPrefs.setEnvironment(environment);
      // setEnvironment must run before setAppId on Android because base URLs
      // are cached on Builder.build(). The native SDK keeps using the prior
      // app id until restart, so the alert nudges a force-quit.
      PushEngage.setEnvironment(environment);
      PushEngage.setAppId(trimmed);
      Alert.alert(
        'Saved',
        'App ID + environment updated. Force-quit and relaunch the app for the change to take full effect on the native SDK.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      Alert.alert('Failed to save', e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color='#224ADB' size='large' />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps='handled'
        >
          <Text style={styles.sectionHeader}>App configuration</Text>
          <Text style={styles.label}>App ID</Text>
          <TextInput
            style={styles.input}
            value={appId}
            onChangeText={setAppId}
            placeholder='Paste your PushEngage site key'
            placeholderTextColor='#999'
            autoCapitalize='none'
            autoCorrect={false}
          />
          <Text style={styles.footer}>
            Find your site key in the PushEngage dashboard. The native SDK
            caches the previous app id, so force-quit and relaunch after
            changing.
          </Text>

          <Text style={styles.sectionHeader}>Environment</Text>
          <View style={styles.segmentedControl}>
            {(['STAGING', 'PRODUCTION'] as DemoEnvironment[]).map(env => {
              const active = environment === env;
              return (
                <TouchableOpacity
                  key={env}
                  style={[styles.segment, active && styles.segmentActive]}
                  onPress={() => setEnvironment(env)}
                >
                  <Text
                    style={[
                      styles.segmentLabel,
                      active && styles.segmentLabelActive,
                    ]}
                  >
                    {env}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.footer}>
            Staging targets internal test infrastructure. Production targets the
            live PushEngage backend.
          </Text>

          <TouchableOpacity
            style={[styles.button, saving && styles.buttonDisabled]}
            onPress={save}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color='#fff' size='small' />
            ) : (
              <Text style={styles.buttonText}>Save</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f7',
  },
  scrollContent: { padding: 16 },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 16,
    letterSpacing: 0.5,
  },
  label: { fontSize: 14, color: '#000', marginBottom: 6 },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 14,
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 8,
  },
  footer: { fontSize: 12, color: '#666', marginBottom: 16 },

  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#e5e5ea',
    borderRadius: 8,
    padding: 3,
    marginBottom: 8,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  segmentActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    letterSpacing: 0.3,
  },
  segmentLabelActive: { color: '#000', fontWeight: '700' },

  button: {
    backgroundColor: '#224ADB',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default SettingsScreen;
