import PushEngage from '@pushengage/pushengage-react-native';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type EventSubscription,
} from 'react-native';
import {
  DEFAULT_APP_ID,
  DEFAULT_ENVIRONMENT,
  DemoPrefs,
  type DemoEnvironment,
} from './DemoPrefs';
import ResponseSheet, { type ResponseSheetState } from './ResponseSheet';
import { SdkEventLog, type SdkEvent } from './SdkEventLog';

type RunArgs = {
  title: string;
  // Returns the JSON-serializable result on success.
  // Throws on failure.
  invoke: () => Promise<unknown>;
};

enum ActionId {
  // Subscription
  Subscribe = 'subscribe',
  Unsubscribe = 'unsubscribe',
  GetSubscriptionStatus = 'getSubscriptionStatus',
  GetSubscriptionNotificationStatus = 'getSubscriptionNotificationStatus',
  GetSubscriberId = 'getSubscriberId',

  // Permissions
  RequestPermission = 'requestPermission',
  GetPermissionStatus = 'getPermissionStatus',
  SetBadgeCount = 'setBadgeCount',
  ClearBadgeCount = 'clearBadgeCount',

  // Profile & attributes
  AddProfileId = 'addProfileId',
  GetSubscriberDetails = 'getSubscriberDetails',
  GetSubscriberAttributes = 'getSubscriberAttributes',
  AddSubscriberAttributes = 'addSubscriberAttributes',
  SetSubscriberAttributes = 'setSubscriberAttributes',
  DeleteAttributes = 'deleteAttributes',
  Identify = 'identify',
  Logout = 'logout',

  // Segments
  AddSegment = 'addSegment',
  RemoveSegments = 'removeSegments',
  AddDynamicSegments = 'addDynamicSegments',

  // Goals & Events
  SendGoal = 'sendGoal',
  TrackEvent = 'trackEvent',

  // Triggers
  TriggerCampaigns = 'triggerCampaigns',

  // In-App Messaging
  InAppMessaging = 'inAppMessaging',

  // Cold-boot verification
  GetInitialNotification = 'getInitialNotification',
}

interface ActionDef {
  id: ActionId;
  label: string;
}

interface Section {
  title: string;
  actions: ActionDef[];
}

const SECTIONS: Section[] = [
  {
    title: 'Subscription',
    actions: [
      { id: ActionId.Subscribe, label: 'Subscribe' },
      { id: ActionId.Unsubscribe, label: 'Unsubscribe' },
      { id: ActionId.GetSubscriptionStatus, label: 'Get Subscription Status' },
      {
        id: ActionId.GetSubscriptionNotificationStatus,
        label: 'Get Subscription Notification Status',
      },
      { id: ActionId.GetSubscriberId, label: 'Get Subscriber ID' },
      {
        id: ActionId.GetInitialNotification,
        label: 'Get Initial Notification (cold-boot)',
      },
    ],
  },
  {
    title: 'Permissions',
    actions: [
      {
        id: ActionId.RequestPermission,
        label: 'Request Notification Permission',
      },
      {
        id: ActionId.GetPermissionStatus,
        label: 'Get Notification Permission Status',
      },
      { id: ActionId.SetBadgeCount, label: 'Set Badge Count' },
      { id: ActionId.ClearBadgeCount, label: 'Clear Badge' },
    ],
  },
  {
    title: 'Profile & Attributes',
    actions: [
      { id: ActionId.AddProfileId, label: 'Add Profile ID' },
      { id: ActionId.GetSubscriberDetails, label: 'Get Subscriber Details' },
      {
        id: ActionId.GetSubscriberAttributes,
        label: 'Get Subscriber Attributes',
      },
      {
        id: ActionId.AddSubscriberAttributes,
        label: 'Add Subscriber Attributes',
      },
      {
        id: ActionId.SetSubscriberAttributes,
        label: 'Set Subscriber Attributes',
      },
      { id: ActionId.DeleteAttributes, label: 'Delete Attributes' },
      { id: ActionId.Identify, label: 'Identify' },
      { id: ActionId.Logout, label: 'Logout' },
    ],
  },
  {
    title: 'Segments',
    actions: [
      { id: ActionId.AddSegment, label: 'Add Segment' },
      { id: ActionId.RemoveSegments, label: 'Remove Segments' },
      { id: ActionId.AddDynamicSegments, label: 'Add Dynamic Segments' },
    ],
  },
  {
    title: 'Goals & Events',
    actions: [
      { id: ActionId.SendGoal, label: 'Send Goal' },
      { id: ActionId.TrackEvent, label: 'Track Event' },
    ],
  },
  {
    title: 'Triggers',
    actions: [{ id: ActionId.TriggerCampaigns, label: 'Trigger Campaigns' }],
  },
  {
    title: 'In-App Messaging',
    actions: [{ id: ActionId.InAppMessaging, label: 'In-App Messaging' }],
  },
];

interface ModalConfig {
  visible: boolean;
  title: string;
  subtitle: string;
  placeholder: string;
  initialValue?: string;
  multiline?: boolean;
  onSubmit: (value: string) => Promise<void>;
  loading?: boolean;
}

const PushEngageScreen = () => {
  const navigation = useNavigation();
  const [appId, setAppId] = useState<string>(DEFAULT_APP_ID);
  const [environment, setEnvironment] =
    useState<DemoEnvironment>(DEFAULT_ENVIRONMENT);
  const [loadingAction, setLoadingAction] = useState<ActionId | null>(null);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    visible: false,
    title: '',
    subtitle: '',
    placeholder: '',
    onSubmit: async () => {},
  });
  const [inputValue, setInputValue] = useState('');
  const [fcmError, setFcmError] = useState<{
    code: number;
    message: string;
  } | null>(null);
  const [events, setEvents] = useState<SdkEvent[]>(SdkEventLog.snapshot());
  const [eventLogExpanded, setEventLogExpanded] = useState(false);
  const [responseSheet, setResponseSheet] = useState<ResponseSheetState>({
    visible: false,
    title: '',
    body: '',
  });

  const valueChangedRef = React.useRef<null | EventSubscription>(null);
  const fcmErrorRef = React.useRef<null | EventSubscription>(null);
  const iamCustomActionRef = React.useRef<null | EventSubscription>(null);

  useEffect(() => {
    DemoPrefs.getAppId().then(setAppId);
    DemoPrefs.getEnvironment().then(setEnvironment);

    valueChangedRef.current = PushEngage.onValueChanged(data => {
      SdkEventLog.info(
        'Deep link received',
        `${data.deepLink}\n${JSON.stringify(data.data, null, 2)}`
      );
    });
    fcmErrorRef.current = PushEngage.onFcmConfigError(event => {
      setFcmError(event);
      SdkEventLog.error(`FCM Config Error (${event.code})`, event.message);
    });
    iamCustomActionRef.current = PushEngage.onIAMCustomAction(action => {
      SdkEventLog.success(
        'In-app custom action',
        `${action.actionId}\n${JSON.stringify(action.parameters, null, 2)}`
      );
    });

    PushEngage.getInitialNotification().then(initial => {
      if (initial) {
        SdkEventLog.success(
          'Cold-boot notification captured',
          `${initial.deepLink}\n${JSON.stringify(initial.data, null, 2)}`
        );
      } else {
        SdkEventLog.info(
          'Cold-boot notification',
          'none — app was not launched from a notification tap'
        );
      }
    });

    const unsubscribe = SdkEventLog.subscribe(setEvents);

    return () => {
      valueChangedRef.current?.remove();
      valueChangedRef.current = null;
      fcmErrorRef.current?.remove();
      fcmErrorRef.current = null;
      iamCustomActionRef.current?.remove();
      iamCustomActionRef.current = null;
      unsubscribe();
    };
  }, []);

  // Refresh persisted appId when the user returns from Settings.
  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      DemoPrefs.getAppId().then(setAppId);
      DemoPrefs.getEnvironment().then(setEnvironment);
    });
    return unsub;
  }, [navigation]);

  const showResponse = (title: string, value: unknown, isError = false) => {
    const body =
      typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    setResponseSheet({ visible: true, title, body, isError });
  };

  const run = async (id: ActionId, args: RunArgs) => {
    setLoadingAction(id);
    SdkEventLog.info(args.title, 'started');
    try {
      const result = await args.invoke();
      SdkEventLog.success(args.title, 'OK');
      showResponse(args.title, result ?? 'OK');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      SdkEventLog.error(args.title, msg);
      showResponse(args.title, msg, true);
    } finally {
      setLoadingAction(null);
    }
  };

  const showModal = (config: Omit<ModalConfig, 'visible' | 'loading'>) => {
    setInputValue(config.initialValue ?? '');
    setModalConfig({ ...config, visible: true, loading: false });
  };

  const handleModalSubmit = async () => {
    // Dismiss keyboard before any modal-close: prevents Fabric SoftException
    // "Unable to find viewState for tag: N for commandId: blur" when the
    // TextInput unmounts while a blur command is still queued.
    Keyboard.dismiss();
    setModalConfig(prev => ({ ...prev, loading: true }));
    try {
      await modalConfig.onSubmit(inputValue);
      setModalConfig(prev => ({ ...prev, visible: false, loading: false }));
      setInputValue('');
    } catch {
      setModalConfig(prev => ({ ...prev, loading: false }));
    }
  };

  const handleAction = (id: ActionId) => {
    switch (id) {
      case ActionId.RequestPermission:
        return run(id, {
          title: 'Request Permission',
          invoke: () =>
            PushEngage.requestNotificationPermission().then(g =>
              g ? 'granted' : 'denied'
            ),
        });

      case ActionId.Subscribe:
        return run(id, {
          title: 'Subscribe',
          invoke: async () => {
            await PushEngage.subscribe();
            return 'Subscribed';
          },
        });

      case ActionId.Unsubscribe:
        return run(id, {
          title: 'Unsubscribe',
          invoke: async () => {
            await PushEngage.unsubscribe();
            return 'Unsubscribed';
          },
        });

      case ActionId.GetSubscriberId:
        return run(id, {
          title: 'Get Subscriber ID',
          invoke: () =>
            PushEngage.getSubscriberId().then(v => v ?? '(not available)'),
        });

      case ActionId.GetInitialNotification:
        return run(id, {
          title: 'Get Initial Notification (cold-boot)',
          invoke: async () => {
            const initial = await PushEngage.getInitialNotification();
            if (!initial) {
              return '(none — drained, or app was not launched from a notification)';
            }
            return initial;
          },
        });

      case ActionId.GetSubscriptionStatus:
        return run(id, {
          title: 'Get Subscription Status',
          invoke: () =>
            PushEngage.getSubscriptionStatus().then(v =>
              v ? 'Subscribed' : 'Not subscribed'
            ),
        });

      case ActionId.GetSubscriptionNotificationStatus:
        return run(id, {
          title: 'Get Subscription Notification Status',
          invoke: () =>
            PushEngage.getSubscriptionNotificationStatus().then(v =>
              v ? 'Can receive notifications' : 'Cannot receive notifications'
            ),
        });

      case ActionId.GetPermissionStatus:
        return run(id, {
          title: 'Get Permission Status',
          invoke: async () => PushEngage.getNotificationPermissionStatus(),
        });

      case ActionId.SetBadgeCount:
        return showModal({
          title: 'Set Badge Count',
          subtitle: 'Number to display on the app icon badge.',
          placeholder: '5',
          initialValue: '5',
          onSubmit: async value => {
            const count = parseInt(value.trim(), 10);
            if (!Number.isFinite(count) || count < 0) {
              SdkEventLog.error(
                'Set Badge Count',
                'Enter a non-negative integer.'
              );
              return;
            }
            await run(id, {
              title: 'Set Badge Count',
              invoke: async () => {
                PushEngage.setBadgeCount(count);
                return `Badge set to ${count}`;
              },
            });
          },
        });

      case ActionId.ClearBadgeCount:
        return run(id, {
          title: 'Clear Badge',
          invoke: async () => {
            PushEngage.setBadgeCount(0);
            return 'Cleared all active notifications';
          },
        });

      case ActionId.Identify:
        return showModal({
          title: 'Identify',
          subtitle:
            'Enter subscriber fields as a JSON object. Valid keys: first_name, last_name, email, phone, gender, dob, language, profile_id, country, city, state, zip.',
          placeholder: '{"email": "jane@example.com"}',
          initialValue:
            '{\n  "email": "jane@example.com",\n  "profile_id": "user_42"\n}',
          multiline: true,
          onSubmit: async value => {
            let fields: Record<string, string | number | boolean>;
            try {
              const parsed = JSON.parse(value);
              if (
                typeof parsed !== 'object' ||
                parsed === null ||
                Array.isArray(parsed)
              ) {
                throw new Error('Payload must be a JSON object.');
              }
              fields = parsed;
            } catch (e) {
              SdkEventLog.error(
                'Identify',
                e instanceof Error ? e.message : 'Invalid JSON.'
              );
              return;
            }
            await run(id, {
              title: 'Identify',
              invoke: async () => {
                await PushEngage.identify(fields);
                return 'Identify OK';
              },
            });
          },
        });

      case ActionId.Logout:
        return showModal({
          title: 'Logout',
          subtitle:
            'Comma separated field names to remove. Leave empty to clear the default PII set (first_name, last_name, email, phone, gender, dob, profile_id).',
          placeholder: 'email, profile_id',
          initialValue: 'email, profile_id',
          onSubmit: async value => {
            const trimmed = value.trim();
            const fieldNames =
              trimmed.length === 0
                ? null
                : trimmed
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean);
            await run(id, {
              title: 'Logout',
              invoke: async () => {
                await PushEngage.logout(fieldNames);
                return fieldNames === null
                  ? 'Logout cleared default PII set'
                  : `Logout cleared: ${fieldNames.join(', ')}`;
              },
            });
          },
        });

      case ActionId.AddProfileId:
        return showModal({
          title: 'Add Profile ID',
          subtitle: 'Enter the profile identifier.',
          placeholder: 'profile_123',
          initialValue: 'user_42',
          onSubmit: async value => {
            await run(id, {
              title: 'Add Profile ID',
              invoke: () => PushEngage.addProfileId(value.trim()),
            });
          },
        });

      case ActionId.AddSubscriberAttributes:
        return showModal({
          title: 'Add Subscriber Attributes',
          subtitle: 'JSON object of key/value pairs.',
          placeholder: '{"age": 25, "city": "NY"}',
          initialValue: '{\n  "age": 25,\n  "city": "NY"\n}',
          multiline: true,
          onSubmit: async value => {
            const attrs = parseJsonObject(value, 'Add Subscriber Attributes');
            if (!attrs) return;
            await run(id, {
              title: 'Add Subscriber Attributes',
              invoke: () =>
                PushEngage.addSubscriberAttributes(
                  attrs as Record<string, string>
                ),
            });
          },
        });

      case ActionId.SetSubscriberAttributes:
        return showModal({
          title: 'Set Subscriber Attributes',
          subtitle: 'JSON object (replaces existing).',
          placeholder: '{"age": 25, "city": "NY"}',
          initialValue: '{\n  "age": 25,\n  "city": "NY"\n}',
          multiline: true,
          onSubmit: async value => {
            const attrs = parseJsonObject(value, 'Set Subscriber Attributes');
            if (!attrs) return;
            await run(id, {
              title: 'Set Subscriber Attributes',
              invoke: () =>
                PushEngage.setSubscriberAttributes(
                  attrs as Record<string, string>
                ),
            });
          },
        });

      case ActionId.GetSubscriberAttributes:
        return run(id, {
          title: 'Get Subscriber Attributes',
          invoke: () => PushEngage.getSubscriberAttributes(),
        });

      case ActionId.GetSubscriberDetails:
        return run(id, {
          title: 'Get Subscriber Details',
          invoke: () =>
            PushEngage.getSubscriberDetails([
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
            ]),
        });

      case ActionId.DeleteAttributes:
        return showModal({
          title: 'Delete Attributes',
          subtitle: 'Comma-separated attribute names',
          placeholder: 'age, city',
          initialValue: 'age, city',
          onSubmit: async value => {
            const list = splitCsv(value);
            await run(id, {
              title: 'Delete Attributes',
              invoke: () => PushEngage.deleteSubscriberAttributes(list),
            });
          },
        });

      case ActionId.AddSegment:
        return showModal({
          title: 'Add Segment',
          subtitle: 'Comma-separated segment names',
          placeholder: 'sports, news',
          initialValue: 'sports, news',
          onSubmit: async value => {
            const list = splitCsv(value);
            await run(id, {
              title: 'Add Segment',
              invoke: () => PushEngage.addSegment(list),
            });
          },
        });

      case ActionId.RemoveSegments:
        return showModal({
          title: 'Remove Segments',
          subtitle: 'Comma-separated segment names',
          placeholder: 'sports, news',
          initialValue: 'sports, news',
          onSubmit: async value => {
            const list = splitCsv(value);
            await run(id, {
              title: 'Remove Segments',
              invoke: () => PushEngage.removeSegment(list),
            });
          },
        });

      case ActionId.AddDynamicSegments:
        return showModal({
          title: 'Add Dynamic Segments',
          subtitle: 'JSON array of {name, duration}.',
          placeholder: '[{"name":"sports","duration":5}]',
          initialValue:
            '[\n  {\n    "name": "sports",\n    "duration": 5\n  }\n]',
          multiline: true,
          onSubmit: async value => {
            let segments: { name: string; duration: number }[];
            try {
              const parsed = JSON.parse(value);
              if (!Array.isArray(parsed))
                throw new Error('Payload must be a JSON array.');
              segments = parsed;
            } catch (e) {
              SdkEventLog.error(
                'Add Dynamic Segments',
                e instanceof Error ? e.message : 'Invalid JSON.'
              );
              return;
            }
            await run(id, {
              title: 'Add Dynamic Segments',
              invoke: () => PushEngage.addDynamicSegment(segments),
            });
          },
        });

      case ActionId.SendGoal:
        (navigation as any).navigate('SendGoal');
        return;

      case ActionId.TrackEvent:
        (navigation as any).navigate('TrackEvent');
        return;

      case ActionId.TriggerCampaigns:
        (navigation as any).navigate('TriggerCampaigns');
        return;

      case ActionId.InAppMessaging:
        (navigation as any).navigate('InAppMessaging');
        return;
    }
  };

  const appIdConfigured = DemoPrefs.isConfigured(appId);

  return (
    <View style={styles.container}>
      {fcmError && (
        <View style={styles.fcmBanner}>
          <View style={styles.fcmBannerContent}>
            <Text style={styles.fcmBannerTitle}>
              FCM Config Error ({fcmError.code})
            </Text>
            <Text style={styles.fcmBannerMessage} numberOfLines={3}>
              {fcmError.message}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setFcmError(null)}>
            <Text style={styles.fcmBannerDismiss}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps='handled'
      >
        <TouchableOpacity
          style={styles.configCard}
          onPress={() => (navigation as any).navigate('Settings')}
          activeOpacity={0.7}
        >
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>ENVIRONMENT</Text>
            <View
              style={[
                styles.envChip,
                environment === 'STAGING'
                  ? styles.envChipStaging
                  : styles.envChipProduction,
              ]}
            >
              <Text style={styles.envChipText}>{environment}</Text>
            </View>
          </View>
          <View style={styles.configDivider} />
          <Text style={styles.configLabel}>APP ID</Text>
          <Text
            style={[
              styles.configValue,
              !appIdConfigured && styles.configValuePlaceholder,
            ]}
            numberOfLines={1}
            ellipsizeMode='middle'
          >
            {appIdConfigured ? appId : 'Not configured · tap to set'}
          </Text>
        </TouchableOpacity>

        {SECTIONS.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionHeader}>{section.title}</Text>
            <View style={styles.sectionBody}>
              {section.actions.map((action, idx) => {
                const isLast = idx === section.actions.length - 1;
                const isLoading = loadingAction === action.id;
                return (
                  <TouchableOpacity
                    key={action.id}
                    style={[styles.row, !isLast && styles.rowDivider]}
                    onPress={() => handleAction(action.id)}
                    disabled={isLoading}
                  >
                    <Text style={styles.rowLabel}>{action.label}</Text>
                    {isLoading ? (
                      <ActivityIndicator color='#224ADB' size='small' />
                    ) : (
                      <Text style={styles.rowChevron}>›</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Fixed-bottom collapsible event log panel — mirrors native demo */}
      <View style={styles.eventLogPanel}>
        <TouchableOpacity
          style={styles.eventLogHeader}
          onPress={() => setEventLogExpanded(prev => !prev)}
          activeOpacity={0.7}
        >
          <Text style={styles.eventLogTitle}>Event log ({events.length})</Text>
          <TouchableOpacity
            onPress={SdkEventLog.clear}
            hitSlop={8}
            style={styles.eventLogClearBtn}
          >
            <Text style={styles.eventLogClearText}>Clear</Text>
          </TouchableOpacity>
          <Text style={styles.eventLogChevron}>
            {eventLogExpanded ? '▼' : '▲'}
          </Text>
        </TouchableOpacity>
        {eventLogExpanded && (
          <ScrollView style={styles.eventLogScroll}>
            {events.length === 0 ? (
              <Text style={styles.eventLogEmpty}>No events yet</Text>
            ) : (
              events.map(event => (
                <Text
                  key={event.id}
                  style={[
                    styles.eventLogLine,
                    event.level === 'success' && styles.eventLogLineSuccess,
                    event.level === 'error' && styles.eventLogLineError,
                  ]}
                >
                  [{new Date(event.timestamp).toLocaleTimeString()}]{' '}
                  {event.title}
                  {event.detail ? ` — ${event.detail.replace(/\n/g, ' ')}` : ''}
                </Text>
              ))
            )}
          </ScrollView>
        )}
      </View>

      <Modal
        animationType='slide'
        transparent
        visible={modalConfig.visible}
        onRequestClose={() => {
          Keyboard.dismiss();
          setModalConfig(prev => ({ ...prev, visible: false }));
        }}
      >
        <View style={styles.bottomSheetBackdrop}>
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHandle} />
            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
            <Text style={styles.modalSubtitle}>{modalConfig.subtitle}</Text>
            <TextInput
              style={[
                styles.modalInput,
                modalConfig.multiline && styles.modalInputMultiline,
              ]}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={modalConfig.placeholder}
              placeholderTextColor='#999'
              autoCapitalize='none'
              autoCorrect={false}
              multiline={modalConfig.multiline}
              textAlignVertical={modalConfig.multiline ? 'top' : 'center'}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => {
                  Keyboard.dismiss();
                  setModalConfig(prev => ({ ...prev, visible: false }));
                  setInputValue('');
                }}
                disabled={modalConfig.loading}
              >
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonOk}
                onPress={handleModalSubmit}
                disabled={modalConfig.loading}
              >
                {modalConfig.loading ? (
                  <ActivityIndicator color='#fff' size='small' />
                ) : (
                  <Text style={styles.submitButton}>OK</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ResponseSheet
        state={responseSheet}
        onClose={() => setResponseSheet(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
};

function parseJsonObject(
  input: string,
  title: string
): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(input);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed))
      throw new Error('Payload must be a JSON object.');
    return parsed;
  } catch (e) {
    SdkEventLog.error(title, e instanceof Error ? e.message : 'Invalid JSON.');
    return null;
  }
}

function splitCsv(input: string): string[] {
  return input
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  // paddingBottom leaves room for the collapsed event log panel.
  scrollContent: { padding: 16, paddingBottom: 64 },

  configCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    padding: 14,
    marginBottom: 20,
  },
  configRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  configLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1,
  },
  configValue: {
    fontSize: 13,
    color: '#222',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  configValuePlaceholder: {
    color: '#B00020',
    fontFamily: undefined,
    fontStyle: 'italic',
  },
  configDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 10,
  },
  envChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 0,
  },
  envChipStaging: { backgroundColor: '#6750A4' },
  envChipProduction: { backgroundColor: '#1a7f37' },
  envChipText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  section: { marginBottom: 20 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionBody: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5ea',
  },
  rowLabel: { fontSize: 15, color: '#000', flex: 1, paddingRight: 8 },
  rowChevron: { fontSize: 22, color: '#c7c7cc' },

  // Native demo Event Log panel — fixed bottom, dark theme, collapsible.
  eventLogPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1E1E1E',
  },
  eventLogHeader: {
    height: 48,
    backgroundColor: '#2A2A2A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  eventLogTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  eventLogClearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  eventLogClearText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  eventLogChevron: {
    color: '#fff',
    fontSize: 14,
    paddingHorizontal: 8,
  },
  eventLogScroll: { maxHeight: 200, padding: 8 },
  eventLogEmpty: {
    color: '#888',
    fontFamily: 'monospace',
    fontSize: 11,
    padding: 4,
  },
  eventLogLine: {
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: 11,
    paddingVertical: 2,
  },
  eventLogLineSuccess: { color: '#7be07b' },
  eventLogLineError: { color: '#ff8888' },

  fcmBanner: {
    backgroundColor: '#B00020',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fcmBannerContent: { flex: 1, paddingRight: 12 },
  fcmBannerTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  fcmBannerMessage: { color: '#fff', fontSize: 12 },
  fcmBannerDismiss: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  bottomSheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 32,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
  modalSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
    lineHeight: 18,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#000',
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  modalInputMultiline: { minHeight: 140, textAlignVertical: 'top' },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButtonCancel: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  modalButtonOk: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: '#224ADB',
    minWidth: 88,
    alignItems: 'center',
  },
  cancelButton: { fontSize: 15, color: '#333', fontWeight: '600' },
  submitButton: { fontSize: 15, color: '#fff', fontWeight: '600' },
});

export default PushEngageScreen;
