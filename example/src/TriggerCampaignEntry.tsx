import PushEngage from '@pushengage/pushengage-react-native';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface DataItem {
  key: string;
  value: string;
}

const TriggerCampaignEntry = () => {
  const [campaignName, setCampaignName] = useState('');
  const [eventName, setEventName] = useState('');
  const [profileId, setProfileId] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [valueInput, setValueInput] = useState('');
  const [dataList, setDataList] = useState<DataItem[]>([]);

  const addData = () => {
    if (keyInput.trim() && valueInput.trim()) {
      setDataList([
        ...dataList,
        { key: keyInput.trim(), value: valueInput.trim() },
      ]);
      setKeyInput('');
      setValueInput('');
    }
  };

  const removeData = (index: number) => {
    setDataList(dataList.filter((_, i) => i !== index));
  };

  const combineMaps = () => {
    return dataList.reduce(
      (acc, item) => {
        acc[item.key] = item.value;
        return acc;
      },
      {} as { [key: string]: string }
    );
  };

  const addTriggerCampaign = async () => {
    try {
      const triggerCampaign = {
        campaignName,
        eventName,
        ...(referenceId && { referenceId }),
        ...(profileId && { profileId }),
        ...combineMaps(),
      };

      const response = await PushEngage.sendTriggerEvent(triggerCampaign);
      Alert.alert('Success', response || 'Trigger campaign added successfully');
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : 'Failed to add trigger campaign'
      );
    }
  };

  const renderTextField = (
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string
  ) => (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor='#999'
    />
  );

  return (
    <ScrollView style={styles.container}>
      {renderTextField(campaignName, setCampaignName, 'Enter campaign name')}
      <View style={styles.spacing} />

      {renderTextField(eventName, setEventName, 'Enter event name')}
      <View style={styles.spacing} />

      {renderTextField(profileId, setProfileId, 'Enter profile id')}
      <View style={styles.spacing} />

      {renderTextField(referenceId, setReferenceId, 'Enter reference id')}
      <View style={styles.spacing} />

      <Text style={styles.sectionTitle}>Enter Data</Text>

      <View style={styles.dataEntryRow}>
        <TextInput
          style={[styles.input, styles.flex1]}
          value={keyInput}
          onChangeText={setKeyInput}
          placeholder='Key'
          placeholderTextColor='#999'
        />
        <View style={styles.smallSpacing} />
        <TextInput
          style={[styles.input, styles.flex1]}
          value={valueInput}
          onChangeText={setValueInput}
          placeholder='Value'
          placeholderTextColor='#999'
        />
        <View style={styles.smallSpacing} />
        <TouchableOpacity style={styles.addButton} onPress={addData}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dataList}>
        {dataList.map((item, index) => (
          <View key={index} style={styles.dataRow}>
            <Text style={styles.dataText}>{`${item.key} : ${item.value}`}</Text>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => removeData(index)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.doneButton} onPress={addTriggerCampaign}>
        <Text style={styles.buttonText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
  },
  spacing: {
    height: 10,
  },
  smallSpacing: {
    width: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  dataEntryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  flex1: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#224ADB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    height: 48,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  dataList: {
    height: 100,
    marginBottom: 20,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dataText: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
    paddingVertical: 8,
  },
  cancelButton: {
    backgroundColor: '#DB2222',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    height: 48,
    justifyContent: 'center',
  },
  doneButton: {
    backgroundColor: '#224ADB',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 50,
    marginBottom: 20,
  },
});

export default TriggerCampaignEntry;
