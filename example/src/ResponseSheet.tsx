import { useEffect, useState } from 'react';
import {
  Alert,
  Clipboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export interface ResponseSheetState {
  visible: boolean;
  title: string;
  body: string;
  isError?: boolean;
}

interface Props {
  state: ResponseSheetState;
  onClose: () => void;
}

// Bottom-sheet style modal that mirrors the native demos'
// ResponseSheetViewController (iOS) / bottom_sheet_request layout (Android).
const ResponseSheet = ({ state, onClose }: Props) => {
  const [visible, setVisible] = useState(state.visible);

  useEffect(() => {
    setVisible(state.visible);
  }, [state.visible]);

  const copy = () => {
    if (state.body.trim()) {
      Clipboard.setString(state.body);
      Alert.alert('Copied', 'Response copied to clipboard.');
    }
  };

  return (
    <Modal
      animationType='slide'
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                state.isError ? styles.titleError : styles.titleSuccess,
              ]}
            >
              {state.title}
            </Text>
            <TouchableOpacity onPress={copy} style={styles.copyButton}>
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.bodyScroll}>
            <Text style={styles.body}>{state.body || '(no body)'}</Text>
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: '700', flex: 1, paddingRight: 8 },
  titleSuccess: { color: '#1a7f37' },
  titleError: { color: '#B00020' },
  copyButton: {
    backgroundColor: '#224ADB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  copyButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  bodyScroll: { maxHeight: 320, marginBottom: 16 },
  body: { fontFamily: 'Menlo', fontSize: 13, color: '#222' },
  closeButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: { color: '#333', fontSize: 15, fontWeight: '600' },
});

export default ResponseSheet;
