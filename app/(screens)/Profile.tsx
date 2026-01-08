import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View, Pressable, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Checkbox } from 'expo-checkbox';
import { validateEmail, validateNumber, setData } from '../../utils/helpers';

function Profile() {
    const router = useRouter();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [number, setNumber] = useState('');
    const [image, setImage] = useState<string | null>(null);

    const [notifyStatuses, setNotifyStatuses] = useState(true);
    const [notifyPasswordChanges, setNotifyPasswordChanges] = useState(true);
    const [notifySpecialOffers, setNotifySpecialOffers] = useState(true);
    const [notifyNewsletter, setNotifyNewsletter] = useState(true);

    const [isLoading, setIsLoading] = useState(true);
    const [isDisabled, setIsDisabled] = useState(true);

    useEffect(() => {
        if (firstName.trim().length > 0 && lastName.trim().length > 0 && validateEmail(email) && validateNumber(number)) {
            setIsDisabled(false);
        } else {
            setIsDisabled(true);
        }
    }, [firstName, lastName, email, number]);

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const request = await AsyncStorage.multiGet(['firstName','lastName', 'email', 'number','image', 'statuses', 'passwordChanges', 'offers', 'newsletters']);
            const results = Object.fromEntries(request);

            setData(results.firstName, setFirstName);
            setData(results.lastName, setLastName);
            setData(results.email, setEmail);
            setData(results.number, setNumber);
            setData(results.image, setImage)
            setData(results.statuses, setNotifyStatuses, notifyStatuses);
            setData(results.passwordChanges, setNotifyPasswordChanges, notifyPasswordChanges);
            setData(results.offers, setNotifySpecialOffers, notifySpecialOffers);
            setData(results.newsletter, setNotifyNewsletter, notifyNewsletter);

        } catch (error) {
            console.log('Something went wrong loading the user information', error);
        } finally {
            setIsLoading(false);
        }
    }

    const change = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: undefined,
            allowsEditing: false,
            quality: 0
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            await AsyncStorage.setItem('image', result.assets[0].uri);
        }
    }

    const remove = async () => {
        setImage('');
        try {
            await AsyncStorage.setItem('image', '');
        } catch (error) {
            console.log('An error occured when trying to remove the image', error);
        }
    }

    const discard = () => {
        fetchData();
    }

    const save = async () => {
        await AsyncStorage.multiSet([
            ['firstName', firstName],
            ['lastName', lastName],
            ['email', email],
            ['number', number],
            ['statuses', notifyStatuses.toString()],
            ['passwordChanges', notifyPasswordChanges.toString()],
            ['offers', notifySpecialOffers.toString()],
            ['newsletter', notifyNewsletter.toString()]
        ]);
        if (image) {
            await AsyncStorage.setItem('image', image);
        }
        Alert.alert('User Information Saved', 'Thank you for using our Little Lemon App!');
    }

    const logout = async () => {
        await AsyncStorage.clear();
        router.replace('/Onboarding');
    }

    return (
        <>
            { isLoading ?
                <ActivityIndicator />
            :
                <>
                    <View style={styles.header}>
                        <TouchableOpacity 
                            onPress={() => router.replace('/Home')}
                            style={[styles.backArrow, styles.center, styles.iconSize]}
                        >
                            <Ionicons 
                                name='arrow-back-outline'
                                size={20}
                                color='white'
                                />
                        </TouchableOpacity>
                        <Image 
                            source={require('../../assets/images/Logo.png')}
                            resizeMode='stretch'
                            style={styles.logo}
                        />
                        { image ?
                            <Image source={{uri: image}} style={[styles.profilePic, styles.iconSize]} />
                            :
                            <View style={[styles.placeholder, styles.center, styles.iconSize]}><Text style={styles.profileText}>{firstName[0]}{lastName && lastName[0]}</Text></View>
                        }
                    </View>
                    <View style={styles.body}>
                        <Text style={styles.title}>Personal information</Text>
                        <Text style={styles.avatarTitle}>Avatar</Text>
                        <View style={styles.avatarPicker}>
                            { image ?
                            <Image source={{uri: image}} style={[styles.profilePic, {height: 70, width: 70, borderRadius: 35}]} />
                                :
                                <View style={[styles.picker, styles.center]}><Text style={styles.profileText}>{firstName[0]}{lastName && lastName[0]}</Text></View>
                            }
                            <Pressable style={[styles.changeAvatarButton, styles.center, styles.border]} onPress={change}><Text style={[styles.changeAvatarButtonText]}>Change</Text></Pressable>
                            <Pressable onPress={remove}><Text style={[styles.removeAvatarButtonText, styles.border]}>Remove</Text></Pressable>
                        </View>
                        
                        <Text style={styles.general}>First Name</Text>
                        <TextInput 
                            style={[styles.input, styles.border]}
                            value={firstName}
                            onChangeText={setFirstName} />

                        <Text style={styles.general}>Last Name</Text>
                        <TextInput 
                            style={[styles.input, styles.border]}
                            value={lastName}
                            onChangeText={setLastName} />

                        <Text style={styles.general}>Email</Text>
                        <TextInput
                            style={[styles.input, styles.border]}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType='email-address' />

                        <Text style={styles.general}>Phone number</Text>
                        <TextInput
                            style={[styles.input, styles.border]}
                            value={number}
                            onChangeText={setNumber}
                            keyboardType='phone-pad'
                            maxLength={10} />
                        
                        <Text style={styles.title}>Email notifications</Text>
                        <View style={styles.checkboxes}>
                            <Checkbox 
                                value={notifyStatuses}
                                onValueChange={setNotifyStatuses}
                                color={notifyStatuses ? '#364e46ff' : undefined}
                            />
                            <Text style={styles.checkboxText}>Order statuses</Text>
                        </View>

                        <View style={styles.checkboxes}>
                            <Checkbox 
                                value={notifyPasswordChanges}
                                onValueChange={setNotifyPasswordChanges}
                                color={notifyPasswordChanges ? '#364e46ff' : undefined}
                            />
                            <Text style={styles.checkboxText}>Password changes</Text>
                        </View>
                        
                        <View style={styles.checkboxes}>
                            <Checkbox 
                                value={notifySpecialOffers}
                                onValueChange={setNotifySpecialOffers}
                                color={notifySpecialOffers ? '#364e46ff' : undefined}
                            />
                            <Text style={styles.checkboxText}>Special offers</Text>
                        </View>
                        
                        <View style={styles.checkboxes}>
                            <Checkbox 
                                value={notifyNewsletter}
                                onValueChange={setNotifyNewsletter}
                                color={notifyNewsletter ? '#364e46ff' : undefined}
                            />
                            <Text style={styles.checkboxText}>Newsletter</Text>
                        </View>

                        <Pressable onPress={logout} style={[styles.logout, styles.center, styles.border]}>
                            <Text style={styles.logoutText}>Log out</Text>
                        </Pressable>

                        <View style={styles.bottomButtons}>
                            <Pressable onPress={discard}>
                                <Text style={[styles.discardChanges, styles.border]}>Discard changes</Text>
                            </Pressable>
                            <Pressable style={[styles.saveChanges, isDisabled ? {backgroundColor: '#d9d9d9ff'} : {backgroundColor: '#364e46ff'}]} onPress={save} disabled={isDisabled}>
                                <Text style={styles.changeAvatarButtonText}>Save changes</Text>
                            </Pressable>
                        </View>
                    </View>
                </>
            }
        </>
    );
}

const styles = StyleSheet.create({
    header: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    logo: {
        height: '50%',
        width: '40%'
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconSize: {
        height: 40,
        width: 40
    },
    backArrow: {
        color: '#ffffff',
        backgroundColor: '#364e46ff',
        marginLeft: 15,
        borderRadius: 20,
    },
    profilePic: {
        borderRadius: 20,
        marginRight: 15
    },
    placeholder: {
        marginRight: 15,
        borderWidth: 1,
        borderRadius: 20,
    },
    profileText: {
        fontSize: 25,
    },
    body: {
        flex: 12,
        borderWidth: 0.5,
        borderColor: '#c0c0c0ff',
        borderRadius: 10,
        marginHorizontal: 10,
        marginBottom: 20
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 15,
        marginTop: 10,
        marginBottom: 5
    },
    avatarTitle: {
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 15,
        marginBottom: 5,
        color: '#a0a0a0ff'
    },
    avatarPicker: {
        flexDirection: 'row',
        marginLeft: 15,
        alignItems: 'center'
    },
    picker: {
        marginRight: 15,
        borderWidth: 1,
        height: 60,
        width: 60,
        borderRadius: 35,
    },
    border: {
        borderWidth: 1,
        borderRadius: 5,
    },
    changeAvatarButton: {
        backgroundColor: '#364e46ff',
        marginRight: 15
    },
    changeAvatarButtonText: {
        color: 'white',
        paddingVertical: 9,
        paddingHorizontal: 18,
    },
    removeAvatarButtonText: {
        color: '#566b64ff',
        fontWeight: '500',
        borderColor: '#3a5d51ff',
        paddingVertical: 8,
        paddingHorizontal: 15
    },
    general: {
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 15,
        marginBottom: 3,
        marginTop: 15,
        color: '#606060ff',
    },
    input: {
        paddingHorizontal: 10,
        marginHorizontal: 15,
    },
    checkboxes: {
        flexDirection: 'row',
        marginLeft: 15,
        marginVertical: 6,
    },
    checkboxText: {
        fontSize: 14,
        paddingLeft: 10,
        alignItems: 'center'
    },
    logout: {
        marginVertical: 20,
        marginHorizontal: 15,
        backgroundColor: '#f4b814ff',
        borderColor: '#bc7100ff'

    },
    logoutText: {
        fontWeight: '700',
        padding: 10,
    },
    bottomButtons: {
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    saveChanges: {
        borderRadius: 5,
        marginRight: 15
    },
    discardChanges: {
        color: '#566b64ff',
        fontWeight: '500',
        borderColor: '#3a5d51ff',
        paddingVertical: 8,
        paddingHorizontal: 15
    },
});

export default Profile