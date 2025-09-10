import PushEngage from '@pushengage/pushengage-react-native';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type EventSubscription,
} from 'react-native';

enum PushEngageAction {
  AddSegment = 'addSegment',
  RemoveSegments = 'removeSegments',
  AddDynamicSegments = 'addDynamicSegments',
  AddSubscriberAttributes = 'addSubscriberAttributes',
  DeleteAttributes = 'deleteAttributes',
  AddProfileId = 'addProfileId',
  GetSubscriberDetails = 'getSubscriberDetails',
  GetSubscriberAttributes = 'getSubscriberAttributes',
  SetSubscriberAttributes = 'setSubscriberAttributes',
  GetNotificationPermissionStatus = 'getNotificationPermissionStatus',
  GetSubscriptionStatus = 'getSubscriptionStatus',
  GetSubscriptionNotificationStatus = 'getSubscriptionNotificationStatus',
  GetSubscriberId = 'getSubscriberId',
  Unsubscribe = 'unsubscribe',
  Subscribe = 'subscribe',
  SendGoal = 'sendGoal',
  TriggerCampaigns = 'triggerCampaigns',
}

const PushEngageActionLabels: Record<PushEngageAction, string> = {
  [PushEngageAction.AddSegment]: 'Add Segment',
  [PushEngageAction.RemoveSegments]: 'Remove Segments',
  [PushEngageAction.AddDynamicSegments]: 'Add Dynamic Segments',
  [PushEngageAction.AddSubscriberAttributes]: 'Add Subscriber Attributes',
  [PushEngageAction.DeleteAttributes]: 'Delete Attributes',
  [PushEngageAction.AddProfileId]: 'Add Profile Id',
  [PushEngageAction.GetSubscriberDetails]: 'Get Subscriber Details',
  [PushEngageAction.GetSubscriberAttributes]: 'Get Subscriber Attributes',
  [PushEngageAction.SetSubscriberAttributes]: 'Set Subscriber Attributes',
  [PushEngageAction.GetNotificationPermissionStatus]: 'Get Permission Status',
  [PushEngageAction.GetSubscriptionStatus]: 'Get Subscription Status',
  [PushEngageAction.GetSubscriptionNotificationStatus]:
    'Get Subscription Notification Status',
  [PushEngageAction.GetSubscriberId]: 'Get Subscriber ID',
  [PushEngageAction.Unsubscribe]: 'Unsubscribe',
  [PushEngageAction.Subscribe]: 'Subscribe',
  [PushEngageAction.SendGoal]: 'Send Goal',
  [PushEngageAction.TriggerCampaigns]: 'Trigger Campaigns',
};

const PushEngageScreen = () => {
  const navigation = useNavigation();
  const [inputText, setInputText] = useState<string>('');
  const [loadingAction, setLoadingAction] = useState<PushEngageAction | null>(
    null
  );
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    subtitle: string;
    placeholder: string;
    onSubmit: (value: string) => Promise<void>;
    loading?: boolean;
  }>({
    visible: false,
    title: '',
    subtitle: '',
    placeholder: '',
    onSubmit: async () => {},
    loading: false,
  });
  const [inputValue, setInputValue] = useState('');

  const listenerSubscription = React.useRef<null | EventSubscription>(null);

  const copyToClipboard = () => {
    if (inputText.trim()) {
      Clipboard.setString(inputText);
      Alert.alert('Copied!', 'Text has been copied to clipboard');
    } else {
      Alert.alert('Nothing to copy', 'The text box is empty');
    }
  };

  React.useEffect(() => {
    listenerSubscription.current = PushEngage.onValueChanged(
      (data: { deepLink: string; data: { [key: string]: string } }) => {
        handleDeepLink(data);
      }
    );

    return () => {
      listenerSubscription.current?.remove();
      listenerSubscription.current = null;
    };
  }, []);

  const showModal = (config: {
    title: string;
    subtitle: string;
    placeholder: string;
    onSubmit: (value: string) => Promise<void>;
  }) => {
    setModalConfig({
      visible: true,
      loading: false,
      ...config,
    });
  };

  const handleModalSubmit = async () => {
    setModalConfig(prev => ({ ...prev, loading: true }));
    try {
      await modalConfig.onSubmit(inputValue);
      setModalConfig(prev => ({ ...prev, visible: false, loading: false }));
      setInputValue('');
    } catch (_error) {
      setModalConfig(prev => ({ ...prev, loading: false }));
    }
  };

  const handleButtonClick = async (action: PushEngageAction) => {
    switch (action) {
      case PushEngageAction.AddSegment:
        showModal({
          title: 'Enter Values',
          subtitle: 'Comma separated values',
          placeholder: 'Enter comma separated values',
          onSubmit: async value => {
            if (value.trim()) {
              const segments = value.split(',').map(segment => segment.trim());
              try {
                const response = await PushEngage.addSegment(segments);
                setInputText(response || 'Segments added successfully');
              } catch (error) {
                setInputText(
                  error instanceof Error ? error.message : String(error)
                );
              }
            } else {
              setInputText('No input provided');
            }
          },
        });
        break;

      case PushEngageAction.RemoveSegments:
        showModal({
          title: 'Enter Values',
          subtitle: 'Comma separated values',
          placeholder: 'Enter segments to remove',
          onSubmit: async value => {
            if (value.trim()) {
              const segments = value.split(',').map(segment => segment.trim());
              try {
                const response = await PushEngage.removeSegment(segments);
                setInputText(response || 'Segments removed successfully');
              } catch (error) {
                setInputText(
                  error instanceof Error ? error.message : String(error)
                );
              }
            } else {
              setInputText('No input provided');
            }
          },
        });
        break;

      case PushEngageAction.AddDynamicSegments:
        showModal({
          title: 'Enter Values',
          subtitle: 'Format: name:days, name:days',
          placeholder: 'e.g., segment1:30, segment2:60',
          onSubmit: async value => {
            if (value.trim()) {
              try {
                const segments = value
                  .split(',')
                  .map(item => {
                    const [name, days] = item.trim().split(':');
                    const trimmedName = name?.trim();
                    return trimmedName
                      ? {
                          name: trimmedName,
                          duration: parseInt(days?.trim() || '0', 10),
                        }
                      : null;
                  })
                  .filter(
                    (segment): segment is { name: string; duration: number } =>
                      segment !== null
                  );
                const response = await PushEngage.addDynamicSegment(segments);
                setInputText(response || 'Dynamic segments added successfully');
              } catch (error) {
                setInputText(
                  error instanceof Error ? error.message : String(error)
                );
              }
            } else {
              setInputText('No input provided');
            }
          },
        });
        break;

      case PushEngageAction.AddSubscriberAttributes:
        showModal({
          title: 'Enter Values',
          subtitle: 'Format: key:value, key:value',
          placeholder: 'e.g., age:25, city:NY',
          onSubmit: async value => {
            if (value.trim()) {
              try {
                const attributes = Object.fromEntries(
                  value
                    .split(',')
                    .map(item => {
                      const [key, value] = item.trim().split(':');
                      return [key?.trim(), value?.trim()];
                    })
                    .filter(([key, value]) => key && value)
                );
                const response =
                  await PushEngage.addSubscriberAttributes(attributes);
                setInputText(response || 'Attributes added successfully');
              } catch (error) {
                setInputText(
                  error instanceof Error ? error.message : String(error)
                );
              }
            } else {
              setInputText('No input provided');
            }
          },
        });
        break;

      case PushEngageAction.DeleteAttributes:
        showModal({
          title: 'Enter Values',
          subtitle: 'Comma separated values',
          placeholder: 'Enter attributes to delete',
          onSubmit: async value => {
            if (value.trim()) {
              const attributes = value.split(',').map(attr => attr.trim());
              try {
                const response =
                  await PushEngage.deleteSubscriberAttributes(attributes);
                setInputText(response || 'Attributes deleted successfully');
              } catch (error) {
                setInputText(
                  error instanceof Error ? error.message : String(error)
                );
              }
            } else {
              setInputText('No input provided');
            }
          },
        });
        break;

      case PushEngageAction.AddProfileId:
        showModal({
          title: 'Enter Profile ID',
          subtitle: 'Please enter your Profile ID',
          placeholder: 'Enter Profile ID',
          onSubmit: async value => {
            if (value.trim()) {
              try {
                const response = await PushEngage.addProfileId(value.trim());
                setInputText(response || 'Profile ID added successfully');
              } catch (error) {
                setInputText(
                  error instanceof Error ? error.message : String(error)
                );
              }
            } else {
              setInputText('No Profile ID provided');
            }
          },
        });
        break;

      case PushEngageAction.GetSubscriberDetails:
        setLoadingAction(action);
        try {
          const subscriberAttributes = [
            'city',
            'device',
            'host',
            'user_agent',
            'has_unsubscribed',
            'device_type',
            'timezone',
            'country',
            'ts_created',
            'state',
            'profile_id',
          ];
          const response =
            await PushEngage.getSubscriberDetails(subscriberAttributes);
          const prettyResponse = JSON.stringify(response, null, 2);
          setInputText(prettyResponse || 'No subscriber details found');
        } catch (error) {
          setInputText(error instanceof Error ? error.message : String(error));
        } finally {
          setLoadingAction(null);
        }
        break;

      case PushEngageAction.GetSubscriberAttributes:
        setLoadingAction(action);
        try {
          const response = await PushEngage.getSubscriberAttributes();
          setInputText(
            response ? JSON.stringify(response, null, 2) : 'No attributes found'
          );
        } catch (error) {
          setInputText(error instanceof Error ? error.message : String(error));
        } finally {
          setLoadingAction(null);
        }
        break;

      case PushEngageAction.SetSubscriberAttributes:
        showModal({
          title: 'Enter Values',
          subtitle: 'Format: key:value, key:value',
          placeholder: 'e.g., age:25, city:NY',
          onSubmit: async value => {
            if (value.trim()) {
              try {
                const attributes = Object.fromEntries(
                  value
                    .split(',')
                    .map(item => {
                      const [key, value] = item.trim().split(':');
                      return [key?.trim(), value?.trim()];
                    })
                    .filter(([key, value]) => key && value)
                );
                const response =
                  await PushEngage.setSubscriberAttributes(attributes);
                setInputText(response || 'Attributes set successfully');
              } catch (error) {
                setInputText(
                  error instanceof Error ? error.message : String(error)
                );
              }
            } else {
              setInputText('No input provided');
            }
          },
        });
        break;

      case PushEngageAction.GetNotificationPermissionStatus:
        try {
          const status = PushEngage.getNotificationPermissionStatus();
          setInputText(`Notification Permission Status: ${status}`);
        } catch (error) {
          setInputText(error instanceof Error ? error.message : String(error));
        }
        break;

      case PushEngageAction.GetSubscriptionStatus:
        setLoadingAction(action);
        try {
          const isSubscribed = await PushEngage.getSubscriptionStatus();
          setInputText(
            `Subscription Status: ${isSubscribed ? 'Subscribed' : 'Not Subscribed'}`
          );
        } catch (error) {
          setInputText(
            `Subscription Status Error: ${error instanceof Error ? error.message : String(error)}`
          );
        } finally {
          setLoadingAction(null);
        }
        break;

      case PushEngageAction.GetSubscriptionNotificationStatus:
        setLoadingAction(action);
        try {
          const canReceiveNotifications =
            await PushEngage.getSubscriptionNotificationStatus();
          setInputText(
            `Can Receive Notifications: ${canReceiveNotifications ? 'Yes (Subscribed + Permission)' : 'No'}`
          );
        } catch (error) {
          setInputText(
            `Full Notification Status Error: ${error instanceof Error ? error.message : String(error)}`
          );
        } finally {
          setLoadingAction(null);
        }
        break;

      case PushEngageAction.GetSubscriberId:
        setLoadingAction(action);
        try {
          const subscriberId = await PushEngage.getSubscriberId();
          if (subscriberId) {
            setInputText(`Subscriber ID: ${subscriberId}`);
          } else {
            setInputText(`Subscriber ID: Not available (user not subscribed)`);
          }
        } catch (error) {
          setInputText(
            `Subscriber ID Error: ${error instanceof Error ? error.message : String(error)}`
          );
        } finally {
          setLoadingAction(null);
        }
        break;

      case PushEngageAction.Unsubscribe:
        setLoadingAction(action);
        try {
          await PushEngage.unsubscribe();
          setInputText(`Successfully unsubscribed from push notifications`);
        } catch (error) {
          setInputText(
            `Unsubscribe Error: ${error instanceof Error ? error.message : String(error)}`
          );
        } finally {
          setLoadingAction(null);
        }
        break;

      case PushEngageAction.Subscribe:
        setLoadingAction(action);
        try {
          await PushEngage.subscribe();
          setInputText(`Successfully subscribed to push notifications`);
        } catch (error) {
          setInputText(
            `Subscribe Error: ${error instanceof Error ? error.message : String(error)}`
          );
        } finally {
          setLoadingAction(null);
        }
        break;

      case PushEngageAction.SendGoal:
        (navigation as any).navigate('SendGoal');
        break;

      case PushEngageAction.TriggerCampaigns:
        (navigation as any).navigate('TriggerCampaigns');
        break;
    }
  };

  const handleDeepLink = (event: {
    deepLink: string;
    data: { [key: string]: string };
  }) => {
    console.log('Deep link received in PushEngageScreen:', event.deepLink);
    console.log('Additional data in PushEngageScreen:', event.data);
    // Handle the deep link and additional data here
    setInputText(
      `Deep link: ${event.deepLink}\nData: ${JSON.stringify(event.data, null, 2)}`
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.textBoxContainer}>
        <View style={styles.textBoxHeader}>
          <Text style={styles.textBoxTitle}>Output</Text>
          <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
            <Text style={styles.copyButtonText}>Copy</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.textBox}>
          <ScrollView>
            <Text style={styles.text}>{inputText}</Text>
          </ScrollView>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {Object.values(PushEngageAction).map(action => (
          <TouchableOpacity
            key={action}
            style={[
              styles.buttonContainer,
              loadingAction === action && styles.buttonDisabled,
            ]}
            onPress={() => handleButtonClick(action)}
            disabled={loadingAction === action}
          >
            {loadingAction === action ? (
              <ActivityIndicator color='#224ADB' size='small' />
            ) : (
              <Text style={styles.buttonText}>
                {PushEngageActionLabels[action]}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={styles.requestButtonContainer}
        onPress={async () => {
          try {
            const granted = await PushEngage.requestNotificationPermission();
            if (granted) {
              setInputText(
                'Notification permission granted! User is now subscribed.'
              );
            } else {
              setInputText('Notification permission denied by user');
            }
          } catch (error) {
            setInputText(
              `Notification permission error: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        }}
      >
        <Text style={styles.requestButtonText}>
          Request Notification Permission
        </Text>
      </TouchableOpacity>

      <Modal
        animationType='fade'
        transparent={true}
        visible={modalConfig.visible}
        onRequestClose={() =>
          setModalConfig(prev => ({ ...prev, visible: false }))
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
            <Text style={styles.modalSubtitle}>{modalConfig.subtitle}</Text>

            <TextInput
              style={styles.modalInput}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={modalConfig.placeholder}
              placeholderTextColor='#999'
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setModalConfig(prev => ({ ...prev, visible: false }));
                  setInputValue('');
                }}
                disabled={modalConfig.loading}
              >
                <Text
                  style={[
                    styles.cancelButton,
                    modalConfig.loading && styles.buttonTextDisabled,
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleModalSubmit}
                disabled={modalConfig.loading}
              >
                {modalConfig.loading ? (
                  <ActivityIndicator color='#224ADB' size='small' />
                ) : (
                  <Text style={styles.submitButton}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 0,
  },
  textBoxContainer: {
    width: '90%',
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 20,
  },
  textBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  textBoxTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  copyButton: {
    backgroundColor: '#4040FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  copyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  textBox: {
    height: 150,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
  },
  text: {
    fontSize: 16,
    color: '#000',
    flexShrink: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 20,
  },
  resultContainer: {
    marginBottom: 20,
  },
  resultText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginVertical: 10,
    marginLeft: 20,
    alignSelf: 'flex-start',
  },
  buttonContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginVertical: 6,
    marginHorizontal: 20,
    alignItems: 'center',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '400',
  },
  requestButtonContainer: {
    backgroundColor: '#4040FF',
    borderRadius: 12,
    marginBottom: 30,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginVertical: 6,
    marginHorizontal: 20,
    alignItems: 'center',
    width: '90%',
  },
  requestButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  modalInput: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  submitButton: {
    fontSize: 16,
    color: '#5856D6',
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonTextDisabled: {
    opacity: 0.5,
  },
});

export default PushEngageScreen;
