import { View, Text, Button, FlatList, ActivityIndicator, Alert , StyleSheet , TouchableOpacity, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';

const HomeScreen = () => {

    const [recordings, setRecordings] = useState([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useFocusEffect(
      useCallback(() => {
        loadRecordings(); // Re-fetch stored audio files
      }, [])
    );

    async function loadRecordings() {
        setLoading(true);
        const storedRecordings = await AsyncStorage.getItem('recordings');
        if (storedRecordings) {
            setRecordings(JSON.parse(storedRecordings));
        }
        console.log("recordings" , storedRecordings);
        setLoading(false);
    }


    const renderItem = (item) => {
        return(
            <View style={styles.audioItem}>
                <MaterialIcons name="mic" size={40} color="#94A3B8" style={styles.audioIcon} />
                <View style={styles.audioInfo}>
                    <Text style={styles.audioName}>{item.filename}</Text>
                    <Text style={styles.audioDetails}>{item.duration} - {item.size}</Text>
                </View>
                <TouchableOpacity style={styles.playButton} onPress={() => openAudioDetails(item)}>
                    <MaterialIcons name="play-arrow" size={30} color="#94A3B8" />
                </TouchableOpacity>
            </View>
        )
    }

    const openAudioDetails = (audio) => {
      router.push({
        pathname: '/AudioDetail',
        params: {
          filename: audio.filename,
          duration: audio.duration,
          uri: audio.uri,
        },
      });
    }

    const openRecordingScreen = () => {
      router.push({ pathname: '/AudioRecord' })
    }

    return (
        <SafeAreaView style={styles.container}>
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            <View style={styles.header}>
                <Text style={styles.title}>Audio Library</Text>
            </View>
            <FlatList
                data={recordings}
                keyExtractor={(item, index) => item.uri || index.toString()}
                renderItem={({ item }) => renderItem(item)} 
            />
            <TouchableOpacity style={styles.fab}>
                <MaterialIcons name="add" size={30} color="white"  onPress={openRecordingScreen}/>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
        color: '#333',
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop:20
    },
    audioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
    },
    audioIcon: {
        marginRight: 15,
    },
    audioInfo: {
        flex: 1,
    },
    audioName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
    },
    audioDetails: {
        fontSize: 14,
        color: '#6B7280',
    },
    playButton: {
        padding: 10,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#1E40AF',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
});

export default HomeScreen;