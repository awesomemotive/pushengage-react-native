import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Modal from 'react-native-modal';
import PushEngage from '@pushengage/pushengage-react-native';

enum SelectedType {
  PriceDrop = 'Price Drop',
  Inventory = 'Inventory',
}

interface DataItem {
  key: string;
  value: string;
}

const AlertEntryScreen = () => {
  const [selectedType, setSelectedType] = useState<SelectedType>(
    SelectedType.PriceDrop
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState('Nil');
  const [profileId, setProfileId] = useState('');
  const [mrp, setMrp] = useState('');
  const [productId, setProductId] = useState('');
  const [link, setLink] = useState('');
  const [price, setPrice] = useState('');
  const [variantId, setVariantId] = useState('');
  const [alertPrice, setAlertPrice] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [valueInput, setValueInput] = useState('');
  const [dataList, setDataList] = useState<DataItem[]>([]);
  const [isTypeModalVisible, setIsTypeModalVisible] = useState(false);
  const [isAvailabilityModalVisible, setIsAvailabilityModalVisible] = useState(false);

  const formatDate = (date: Date) => {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getCombinedDateTime = () => {
    if (selectedDate && selectedTime) {
      const combined = new Date(selectedDate);
      combined.setHours(selectedTime.getHours());
      combined.setMinutes(selectedTime.getMinutes());
      return combined;
    }
    return null;
  };

  const addData = () => {
    if (keyInput.trim() && valueInput.trim()) {
      setDataList([...dataList, { key: keyInput.trim(), value: valueInput.trim() }]);
      setKeyInput('');
      setValueInput('');
    }
  };

  const removeData = (index: number) => {
    setDataList(dataList.filter((_, i) => i !== index));
  };

  const combineMaps = () => {
    return dataList.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as { [key: string]: string });
  };

  const addAlert = async () => {
    try {
      const alert = {
        type:
          selectedType === SelectedType.PriceDrop ? 'priceDrop' : 'inventory',
        productId,
        link,
        price: parseFloat(price) || 0,
        variantId: variantId || null,
        expiryTimestamp: getCombinedDateTime()?.toISOString(),
        alertPrice: alertPrice ? parseFloat(alertPrice) : null,
        availability:
          selectedAvailability === 'Out of Stock' ? 'outOfStock' : null,
        profileId: profileId || null,
        mrp: mrp ? parseFloat(mrp) : null,
        data: combineMaps(),
      };

      const response = await PushEngage.addAlert(alert);
      Alert.alert('Success', response || 'Alert added successfully');
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to add alert'
      );
    }
  };

  const renderTextField = (
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    keyboardType: 'default' | 'numeric' = 'default'
  ) => (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#999"
      keyboardType={keyboardType}
    />
  );

  return (
    <ScrollView style={styles.container}>
      {renderTextField(profileId, setProfileId, 'Enter profile id')}
      <View style={styles.spacing} />
      
      {renderTextField(mrp, setMrp, 'MRP', 'numeric')}
      <View style={styles.spacing} />

      <Text style={styles.label}>Select type</Text>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setIsTypeModalVisible(true)}
      >
        <Text style={styles.pickerButtonText}>{selectedType}</Text>
      </TouchableOpacity>

      {renderTextField(productId, setProductId, 'Enter product id')}
      <View style={styles.spacing} />
      
      {renderTextField(link, setLink, 'Enter link')}
      <View style={styles.spacing} />
      
      {renderTextField(price, setPrice, 'Enter price', 'numeric')}
      <View style={styles.spacing} />
      
      {renderTextField(variantId, setVariantId, 'Enter variant id')}
      <View style={styles.spacing} />
      
      {renderTextField(alertPrice, setAlertPrice, 'Enter alert price', 'numeric')}
      <View style={styles.spacing} />

      <Text style={styles.label}>Select expiry time</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button, styles.flex1]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.buttonText}>
            {selectedDate ? formatDate(selectedDate) : 'Select Date'}
          </Text>
        </TouchableOpacity>
        <View style={styles.smallSpacing} />
        <TouchableOpacity
          style={[styles.button, styles.flex1]}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.buttonText}>
            {selectedTime ? formatTime(selectedTime) : 'Select Time'}
          </Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          onChange={(_, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={selectedTime || new Date()}
          mode="time"
          onChange={(event, date) => {
            setShowTimePicker(false);
            if (date) setSelectedTime(date);
          }}
        />
      )}

      <View style={styles.spacing} />

      <Text style={styles.label}>Select Availability</Text>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setIsAvailabilityModalVisible(true)}
      >
        <Text style={styles.pickerButtonText}>{selectedAvailability}</Text>
      </TouchableOpacity>

      <View style={styles.spacing} />

      <Text style={styles.sectionTitle}>Enter Data</Text>
      <View style={styles.dataEntryRow}>
        <TextInput
          style={[styles.input, styles.flex1]}
          value={keyInput}
          onChangeText={setKeyInput}
          placeholder="Key"
          placeholderTextColor="#999"
        />
        <View style={styles.smallSpacing} />
        <TextInput
          style={[styles.input, styles.flex1]}
          value={valueInput}
          onChangeText={setValueInput}
          placeholder="Value"
          placeholderTextColor="#999"
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

      <TouchableOpacity style={styles.doneButton} onPress={addAlert}>
        <Text style={styles.buttonText}>Done</Text>
      </TouchableOpacity>

      <Modal
        isVisible={isTypeModalVisible}
        onBackdropPress={() => setIsTypeModalVisible(false)}
        style={styles.modalContainer}
      >
        <View style={styles.pickerModalContent}>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => {
              setSelectedType(SelectedType.PriceDrop);
              setIsTypeModalVisible(false);
            }}
          >
            <Text style={styles.pickerButtonText}>Price Drop</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => {
              setSelectedType(SelectedType.Inventory);
              setIsTypeModalVisible(false);
            }}
          >
            <Text style={styles.pickerButtonText}>Inventory</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        isVisible={isAvailabilityModalVisible}
        onBackdropPress={() => setIsAvailabilityModalVisible(false)}
        style={styles.modalContainer}
      >
        <View style={styles.pickerModalContent}>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => {
              setSelectedAvailability('Nil');
              setIsAvailabilityModalVisible(false);
            }}
          >
            <Text style={styles.pickerButtonText}>Nil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => {
              setSelectedAvailability('Out of Stock');
              setIsAvailabilityModalVisible(false);
            }}
          >
            <Text style={styles.pickerButtonText}>Out of Stock</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    backgroundColor: '#ffffff',
  },
  spacing: {
    height: 10,
  },
  smallSpacing: {
    width: 10,
  },
  label: {
    fontSize: 16,
    color: '#4040FF',
    marginBottom: 8,
  },
  pickerContainer: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  picker: {
    marginLeft: -8,
    height: 48,
    width: '100%',
    color: '#000000',
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#224ADB',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  flex1: {
    flex: 1,
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
  addButton: {
    backgroundColor: '#224ADB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    height: 48,
    justifyContent: 'center',
  },
  dataList: {
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
  pickerButton: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#000000',
  },
  modalContainer: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  pickerModalContent: {
    backgroundColor: '#ffffff',
    paddingBottom: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
  },
});

export default AlertEntryScreen;