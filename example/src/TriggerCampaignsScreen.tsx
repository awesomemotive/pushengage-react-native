import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PushEngage from '@pushengage/pushengage-react-native';

const TriggerCampaignsScreen = () => {
  const navigation = useNavigation();
  const [isEnableLoading, setIsEnableLoading] = useState(false);
  const [isDisableLoading, setIsDisableLoading] = useState(false);

  const handleEnableAutomatedNotification = async () => {
    setIsEnableLoading(true);
    try {
      const response = await PushEngage.automatedNotification(true);
      Alert.alert(
        'Success',
        response ?? 'Automated notification has been enabled successfully'
      );
      console.log('Automated notification enabled:', response);
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to enable automated notification. Please try again.'
      );
      console.error('Error enabling automated notification:', error);
    } finally {
      setIsEnableLoading(false);
    }
  };

  const handleDisableAutomatedNotification = async () => {
    setIsDisableLoading(true);
    try {
      const response = await PushEngage.automatedNotification(false);
      Alert.alert(
        'Success',
        response ?? 'Automated notification has been disabled successfully'
      );
      console.log('Automated notification disabled:', response);
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to disable automated notification. Please try again.'
      );
      console.error('Error disabling automated notification:', error);
    } finally {
      setIsDisableLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('TriggerCampaignEntry')}
      >
        <Text style={styles.buttonText}>Send Trigger Event</Text>
      </TouchableOpacity>

      <View style={styles.spacing} />

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AlertEntry')}
      >
        <Text style={styles.buttonText}>Add Alert</Text>
      </TouchableOpacity>

      <View style={styles.spacing} />

      <TouchableOpacity
        style={styles.button}
        disabled={isEnableLoading}
        onPress={handleEnableAutomatedNotification}
      >
        {isEnableLoading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Enable Automated Notification</Text>
        )}
      </TouchableOpacity>

      <View style={styles.spacing} />

      <TouchableOpacity
        style={styles.button}
        disabled={isDisableLoading}
        onPress={handleDisableAutomatedNotification}
      >
        {isDisableLoading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Disable Automated Notification</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  button: {
    backgroundColor: '#224ADB',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  spacing: {
    height: 16,
  },
});

export default TriggerCampaignsScreen; 