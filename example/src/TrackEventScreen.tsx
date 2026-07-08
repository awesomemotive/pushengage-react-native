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

const TrackEventScreen = () => {
  const [eventName, setEventName] = useState('');
  const [dataJson, setDataJson] = useState('');
  const [profileId, setProfileId] = useState('');
  const [provider, setProvider] = useState('');
  const [eventType, setEventType] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!eventName.trim()) {
      Alert.alert('Missing eventName', 'eventName is required.');
      return;
    }

    let data: Record<string, string | number | boolean> | undefined;
    if (dataJson.trim()) {
      try {
        const parsed = JSON.parse(dataJson);
        if (
          typeof parsed !== 'object' ||
          parsed === null ||
          Array.isArray(parsed)
        ) {
          Alert.alert('Invalid data', 'data must be a JSON object.');
          return;
        }
        data = parsed;
      } catch (e) {
        Alert.alert(
          'Invalid JSON',
          e instanceof Error ? e.message : 'Could not parse data.'
        );
        return;
      }
    }

    setLoading(true);
    try {
      await PushEngage.trackEvent({
        eventName: eventName.trim(),
        data,
        profileId: profileId.trim() || undefined,
        provider: provider.trim() || undefined,
        eventType: eventType.trim() || undefined,
      });
      Alert.alert('Success', 'Event tracked.');
    } catch (error) {
      Alert.alert(
        'Track event failed',
        error instanceof Error ? error.message : String(error)
      );
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
          <Text style={styles.label}>Event name *</Text>
          <TextInput
            style={styles.input}
            value={eventName}
            onChangeText={setEventName}
            placeholder='e.g., MySite.AddToCart'
            placeholderTextColor='#999'
            autoCapitalize='none'
          />

          <Text style={styles.label}>Data (JSON object)</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={dataJson}
            onChangeText={setDataJson}
            placeholder='{"product_id": "123", "qty": 2}'
            placeholderTextColor='#999'
            multiline
            autoCapitalize='none'
          />

          <Text style={styles.label}>Profile ID</Text>
          <TextInput
            style={styles.input}
            value={profileId}
            onChangeText={setProfileId}
            placeholder='Optional'
            placeholderTextColor='#999'
            autoCapitalize='none'
          />

          <Text style={styles.label}>Provider</Text>
          <TextInput
            style={styles.input}
            value={provider}
            onChangeText={setProvider}
            placeholder='Defaults to "PushEngage"'
            placeholderTextColor='#999'
            autoCapitalize='none'
          />

          <Text style={styles.label}>Event type</Text>
          <TextInput
            style={styles.input}
            value={eventType}
            onChangeText={setEventType}
            placeholder='Defaults to "PushEngage.CustomEvent"'
            placeholderTextColor='#999'
            autoCapitalize='none'
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={submit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color='#fff' size='small' />
            ) : (
              <Text style={styles.buttonText}>Track Event</Text>
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

export default TrackEventScreen;
