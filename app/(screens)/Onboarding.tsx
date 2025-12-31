import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TextInput, View, Image, Pressable} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { validateEmail } from '../../utils/helpers';

function Onboarding() {
    const router = useRouter();

    const [name, onChangeName] = useState('');
    const [email, onChangeEmail] = useState('');
    const [isDisabled, setIsDisabled] = useState(true);

    const next = async () => {
        if (name.trim().length > 0 && validateEmail(email)) {
            try {
                await AsyncStorage.setItem('firstName', name);
                await AsyncStorage.setItem('email', email);
            } catch (error) {
                console.log("An error occured while trying to save your information: ", error);
            } finally {
                router.replace('/Profile');
            }
        }
    }

    useEffect(() => {
        if (name.trim().length === 0 || !validateEmail(email)) {
            setIsDisabled(true);
        } else {
            setIsDisabled(false);
        }
    }, [name, email]);

    return (
    <View style={styles.container}>
        <View style={styles.header}>
            <Image 
                source={require('../../assets/images/Logo.png')}
                resizeMode='stretch'
                style={styles.logo}
            />
        </View>
        <View style={styles.body}>
            <Text style={styles.greet}>Let us get to know you</Text>
            <Text style={[styles.formStart, styles.text]}>First Name</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={onChangeName}
                keyboardType='default'
            ></TextInput>
            <Text style={styles.text}>Email</Text>
            <TextInput
                style={styles.input}
                value={email}
                onChangeText={onChangeEmail}
                keyboardType='email-address'
            ></TextInput>
        </View>
        <View style={styles.footer}>
            <Pressable
                style={[styles.button, isDisabled ? {backgroundColor: '#d9d9d9ff'} : {backgroundColor: '#a7aeb6ff'}]}
                onPress={next}
                disabled={isDisabled}
                >
                <Text style={[styles.text, isDisabled ? {color: '#bec2f4ff'} : {color: '#364752'}]}>Next</Text>
            </Pressable>
        </View>
    </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        flex: 1,
        padding: 10
    },

    header: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#D9DFE6'
    },

    body: {
        flex: 10,
        backgroundColor: '#C4CCD4'
    },

    greet: {
        color: '#364752',
        fontSize: 20,
        fontWeight: 500,
        textAlign: 'center',
        paddingVertical: 80
    },

    formStart: {
        paddingTop: 80,
    },

    text: {
        color: '#364752',
        fontSize: 20,
        fontWeight: 500,
        textAlign: 'center',
        marginVertical: 10
    },

    error: {
        color: 'red',
        textAlign: 'center'
    },

    input: {
        borderWidth: 3,
        borderColor: '#364752',
        borderRadius: 7,
        marginHorizontal: 50,
        paddingLeft: 10,
        color: '#364752',
        fontSize: 20,
        fontWeight: 500,
    },

    footer: {
        flex: 4,
        backgroundColor: '#E9E9E9',
        justifyContent: 'center',
        alignItems: 'flex-end'
    },

    button: {
        height: 45,
        width: 120,
        alignItems: 'center',
        borderRadius: 7,
        marginRight: 45
    },

    logo: {
        height: '60%',
        width: '80%'
    },

});

export default Onboarding