
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import * as Permissions from 'expo-permissions';

export default function AudioRecord() {
  const [recording, setRecording] = useState(null);

  const requestAudioPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    if (status === 'granted') {
      console.log('Permission to record audio granted!');
      return
    } else {
      console.log('Permission to record audio denied.');
    }
  };

  async function startRecording() {
    try {
        requestAudioPermission();
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    const newRecording = { id: Date.now().toString(), uri };
    const updatedRecordings = [...recordings, newRecording];
    setRecordings(updatedRecordings);
    await AsyncStorage.setItem('recordings', JSON.stringify(updatedRecordings));
    setRecording(null);
    Alert.alert('Recording saved');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your library</Text>
      <TouchableOpacity
        style={styles.recordButton}
        onPress={recording ? stopRecording : startRecording}
      >
        <MaterialIcons name={recording ? 'stop' : 'mic'} size={50} color="white" />
      </TouchableOpacity>
      <Text style={styles.instruction}>Click on the button to start recording</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  recordButton: {
    backgroundColor: '#6DBA75',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  instruction: {
    marginTop: 20,
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
  },
});

