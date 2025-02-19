
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { useState , useEffect} from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type RecordingObject = {
  filename: string;
  uri: string;
  duration: string;
  size: string;
}

export default function AudioRecord() {
  const [recording, setRecording] = useState<Audio.Recording>();
  const [recordings, setRecordings] = useState<RecordingObject[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<Audio.PermissionStatus>();

  useEffect(() => {
    requestAudioPermission();
  }, []);

  const requestAudioPermission = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    setPermissionStatus(status);
    if (status !== 'granted') {
      alert('Permission to access microphone is required!');
    }
  };

  const recordingOptions = {
    android: {
      extension: '.m4a',
      outputFormat: Audio.RecordingOptionsPresets.HIGH_QUALITY.android.outputFormat,
      audioEncoder: Audio.RecordingOptionsPresets.HIGH_QUALITY.android.audioEncoder,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
    },
    ios: {
      extension: '.m4a',
      outputFormat: Audio.RecordingOptionsPresets.HIGH_QUALITY.ios.outputFormat,
      audioQuality: Audio.RecordingOptionsPresets.HIGH_QUALITY.ios.audioQuality,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    web: {
      mimeType: 'audio/webm',
      bitsPerSecond: 128000,
    },
  };

  const startRecording = async () => {
    try {
      if (permissionStatus !== 'granted') {
        alert('Please grant audio permissions first!');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(recordingOptions);
      await newRecording.startAsync();
      setRecording(newRecording);
      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording', error);
      alert('Failed to start recording. Check permissions and try again.');
    }
  };

  const stopRecording = async () => {
    try {
      await recording?.stopAndUnloadAsync();
      const uri = recording?.getURI();
      // Generate filename (audio1.mp3, audio2.mp3, etc.)
      const newFilename = await getNextAudioFilename();
      const newPath = `${FileSystem.documentDirectory}${newFilename}`;

      // Move the file to persistent storage
      await FileSystem.moveAsync({
        from: uri ?? '',
        to: newPath,
      });

      const status = await recording?.getStatusAsync();
      const fileInfo = await FileSystem.getInfoAsync(newPath);

      // Save metadata
      const newAudio = { filename: newFilename, uri: newPath, duration: formatDuration(status?.durationMillis ?? 0) , size: formatFileSize(fileInfo?.exists ? fileInfo?.size : 0), };
      const updatedRecordings = [...recordings, newAudio];
      setRecordings(updatedRecordings);
      await AsyncStorage.setItem('recordings', JSON.stringify(updatedRecordings));
      setRecording(undefined);
      console.log('Recording saved at:', uri);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const getNextAudioFilename = async () => {
    const savedRecordings = await AsyncStorage.getItem('recordings');
    const recordingList = savedRecordings ? JSON.parse(savedRecordings) : [];
    return `audio${recordingList.length + 1}.mp3`;
  };

  const formatDuration = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 MB";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

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

