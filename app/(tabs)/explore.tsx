import { View, Text, Button, FlatList, ActivityIndicator, Alert , TouchableOpacity , StyleSheet, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from "expo-sharing";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter} from 'expo-router';
import { useCallback } from 'react';

type FileType = {
    id: string;
    name: any;
    uri: any;
}

export default function Explore() {

    const [files, setFiles] = useState<FileType[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useFocusEffect(
      useCallback(() => {
        loadFiles(); // Re-fetch stored files
      }, [])
    );

    async function loadFiles() {
        setLoading(true);
        const storedFiles = await AsyncStorage.getItem('files');
        console.log('files' , storedFiles);
        if (storedFiles) {
            setFiles(JSON.parse(storedFiles));
        }
        setLoading(false);
    }

    async function pickFile() {
        setLoading(true);
        let result = await DocumentPicker.getDocumentAsync({});
        console.log('result ofupload', result)
        if (!result.canceled) {
            const newFile = { id: Date.now().toString(), name: result.assets[0].name, uri: result.assets[0].uri };
            const updatedFiles = [...files, newFile];
            setFiles(updatedFiles);
            await AsyncStorage.setItem('files', JSON.stringify(updatedFiles));
            Alert.alert('Success', 'File added successfully');
        }
        setLoading(false);
    }

    const renderItem = (doc: FileType) => {
        return(
          <TouchableOpacity style={styles.listItem} onPress={() => openDocumentViewer(doc)}>
            <MaterialIcons name="insert-drive-file" size={24} color="#8A7EA0" />
            <Text style={styles.itemText}>{doc.name}</Text>
          </TouchableOpacity>
        )
    }

    const openDocumentViewer = async (doc: FileType) => {
      try {
        if (Platform.OS === "android") {
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(doc.uri, { mimeType: "application/pdf" });
          }
        } else {
          Alert.alert("Opening PDFs internally is not supported on iOS.");
        }
      } catch (error) {
        Alert.alert("Error opening PDF", error?.message );
      }
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
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      margin:20
    },
    itemText: {
      marginLeft: 10,
      fontSize: 16,
      color: '#444',
    },
});