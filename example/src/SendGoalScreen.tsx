import PushEngage from '@pushengage/pushengage-react-native';
import { useState } from 'react';
import {
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

const SendGoalScreen = () => {
  const [goalName, setGoalName] = useState('');
  const [count, setCount] = useState('');
  const [value, setValue] = useState('');

  const sendGoal = async () => {
    try {
      const goal: Record<string, string | number> = {
        name: goalName,
      };

      // Only add count if it's provided and valid
      if (count && count.trim() !== '') {
        const parsedCount = parseInt(count, 10);
        if (!isNaN(parsedCount)) {
          goal.count = parsedCount;
        }
      }

      // Only add value if it's provided and valid
      if (value && value.trim() !== '') {
        const parsedValue = parseFloat(value);
        if (!isNaN(parsedValue)) {
          goal.value = parsedValue;
        }
      }

      const response = await PushEngage.sendGoal(goal);
      Alert.alert('Success', response || 'Goal sent successfully');
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to add send goal'
      );
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps='handled'
        >
          <Text style={styles.label}>Enter Goal Name</Text>
          <TextInput
            style={styles.input}
            value={goalName}
            onChangeText={setGoalName}
            placeholder='enter name'
            placeholderTextColor='#999'
          />

          <Text style={styles.label}>Enter Count</Text>
          <TextInput
            style={styles.input}
            value={count}
            onChangeText={setCount}
            placeholder='enter count'
            placeholderTextColor='#999'
            keyboardType='numeric'
          />

          <Text style={styles.label}>Enter Value</Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            placeholder='enter value'
            placeholderTextColor='#999'
            keyboardType='numeric'
          />

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              sendGoal();
              dismissKeyboard();
            }}
          >
            <Text style={styles.buttonText}>Send Goal</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  button: {
    backgroundColor: '#224ADB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SendGoalScreen;
