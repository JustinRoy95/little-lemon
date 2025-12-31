// app/(screens)/_layout.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

export default function ScreensLayout() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const nameData = await AsyncStorage.getItem('firstName');
                const emailData = await AsyncStorage.getItem('email');
                if (nameData != null) {
                    setName(nameData);
                }
                if (emailData != null) {
                    setEmail(emailData);
                }
            } catch (error) {
                console.log("Something went wrong while trying to retrieve login information", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);
    

    return (
        <>
            { isLoading ?
                <ActivityIndicator /> 
                :
                <Stack>
                    { name && email ? 
                    <Stack.Screen name="Profile"/>
                    : 
                    <Stack.Screen name="Onboarding"/>
                    }
                </Stack>
            }
        </>
    );
}