import { View, Text, Button, FlatList, ActivityIndicator, Alert , TouchableOpacity , StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Explore() {

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadFiles();
    }, []);

    async function loadFiles() {
        setLoading(true);
        const storedFiles = await AsyncStorage.getItem('files');
        if (storedFiles) {
            setFiles(JSON.parse(storedFiles));
        }
        setLoading(false);
    }

    async function pickFile() {
        setLoading(true);
        let result = await DocumentPicker.getDocumentAsync({});
        if (!result.canceled) {
            const newFile = { id: Date.now().toString(), name: result.name, uri: result.uri };
            const updatedFiles = [...files, newFile];
            setFiles(updatedFiles);
            await AsyncStorage.setItem('files', JSON.stringify(updatedFiles));
            Alert.alert('Success', 'File added successfully');
        }
        setLoading(false);
    }

    const renderItem = (doc) => {
        return(
            <TouchableOpacity 
                key={doc.id}
                style={styles.documentItem}
                onPress={() => console.log('Open document:', doc.id)}
            >
                <Text style={styles.documentText}>{doc.name}</Text>
            </TouchableOpacity>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            <View style={styles.header}>
                <Text style={styles.title}>Your Documents</Text>
            </View>
            <FlatList
                data={files}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => renderItem(item)}
            />
            <TouchableOpacity style={styles.fab}>
                <MaterialIcons name="add" size={30} color="white"  onPress={pickFile}/>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: 'white',
        marginTop:20
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
        color: '#333',
    },
    listContainer: {
        padding: 16,
    },
    documentItem: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 8,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    documentText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#444',
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