import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { AntDesign } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';


export default function AudioDetailsScreen() {
    const { filename, uri, duration } = useLocalSearchParams();
    const router = useRouter();

    const [sound, setSound] = useState<Audio.Sound>();
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState('00:00');

    const soundRef = useRef<Audio.Sound>();

    useEffect(() => {
      loadAudio();
      return () => {
        if (sound) {
          sound.unloadAsync();
        }
      };
    }, []);

    const loadAudio = async () => {
        if (uri) {
            const { sound } = await Audio.Sound.createAsync({ uri }, {}, onPlaybackUpdate);
            setSound(sound);
            soundRef.current = sound;
        }
    };

    const onPlaybackUpdate = (status: { isLoaded: any; positionMillis: number; durationMillis: number; }) => {
        if (status.isLoaded && status.positionMillis) {
            setProgress(status.positionMillis / status.durationMillis);
            setCurrentTime(formatTime(status.positionMillis));
        }
    };

    const formatTime = (millis: number) => {
        const minutes = Math.floor(millis / 60000);
        const seconds = Math.floor((millis % 60000) / 1000);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const togglePlayback = async () => {
        if (sound) {
            if (isPlaying) {
                await sound.pauseAsync();
            } else {
                await sound.playAsync();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const audioTime = Number(duration);

    return (
        <View style={styles.container}>
    
            <Text style={styles.header}>Your Library</Text>
    
            <Image source={require('../assets/images/audio-background.jpg')} style={styles.image} />
            <Text style={styles.audioTitle}>{filename}</Text>

            <Slider
                style={styles.slider}
                value={progress}
                minimumValue={0}
                maximumValue={audioTime > 0 ? audioTime : 1}
                minimumTrackTintColor="#5EA4FF"
                maximumTrackTintColor="#D3D3D3"
            />

            <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{currentTime}</Text>
                <Text style={styles.timeText}>{duration}</Text>
            </View>
    
            <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
                <AntDesign name={isPlaying ? 'pausecircle' : 'playcircleo'} size={60} color="#5EA4FF" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 50,
  },
  image: {
    width: 150,
    height: 150,
    marginVertical: 20,
  },
  audioTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  slider: {
    width: '90%',
    height: 40,
  },
  timeContainer: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeText: {
    fontSize: 14,
    color: '#6F6F6F',
  },
  playButton: {
    marginTop: 20,
  },
});
