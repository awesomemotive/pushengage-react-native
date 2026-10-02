import PushEngage from '@pushengage/pushengage-react-native';
import { useState } from 'react';
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
import { SdkEventLog } from './SdkEventLog';

const InAppMessagingScreen = () => {
  const [eventName, setEventName] = useState('');
  const [paramsJson, setParamsJson] = useState('');
  const [loading, setLoading] = useState(false);

  const trigger = async () => {
    if (!eventName.trim()) {
      Alert.alert('Missing event name', 'Event name is required.');
      return;
    }

    let parameters: Record<string, string | number | boolean> | undefined;
    if (paramsJson.trim()) {
      try {
        const parsed = JSON.parse(paramsJson);
        if (
          typeof parsed !== 'object' ||
          parsed === null ||
          Array.isArray(parsed)
        ) {
          Alert.alert(
            'Invalid parameters',
            'Parameters must be a JSON object.'
          );
          return;
        }
        parameters = parsed;
      } catch (e) {
        Alert.alert(
          'Invalid JSON',
          e instanceof Error ? e.message : 'Could not parse parameters.'
        );
        return;
      }
    }

    setLoading(true);
    try {
      await PushEngage.triggerIAMEvent(eventName.trim(), parameters);
      SdkEventLog.success('Trigger In-App Event', eventName.trim());
      Alert.alert(
        'Success',
        'Event triggered. A matching in-app message (if any is synced and eligible) will display.'
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      SdkEventLog.error('Trigger In-App Event', msg);
      Alert.alert('Trigger failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps='handled'
        >
          <Text style={styles.hint}>
            Custom-action button taps arrive via PushEngage.onIAMCustomAction
            and are appended to the home-screen event log.
          </Text>

          <Text style={styles.label}>Event name *</Text>
          <TextInput
            style={styles.input}
            value={eventName}
            onChangeText={setEventName}
            placeholder='e.g., onboarding_complete'
            placeholderTextColor='#999'
            autoCapitalize='none'
          />

          <Text style={styles.label}>Parameters (JSON object)</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={paramsJson}
            onChangeText={setParamsJson}
            placeholder='{"step": "complete"}'
            placeholderTextColor='#999'
            multiline
            autoCapitalize='none'
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={trigger}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color='#fff' size='small' />
            ) : (
              <Text style={styles.buttonText}>Trigger In-App Event</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 16 },
  hint: { fontSize: 13, color: '#666', marginBottom: 12, lineHeight: 18 },
  label: { fontSize: 14, color: '#000', marginBottom: 6, marginTop: 8 },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 15,
    color: '#000',
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
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

export default InAppMessagingScreen;
