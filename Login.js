import React, { useState } from 'react';
import {
    Text,
    TouchableOpacity,
    ImageBackground,
    Platform,
    StyleSheet,
    View,
    Image,
    KeyboardAvoidingView,
    ActivityIndicator,
} from 'react-native';
import { useFormik } from 'formik';
import * as yup from 'yup';
import Constants from 'expo-constants';
import { AsyncStorage } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TextInput } from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';
import Toast from 'react-native-simple-toast';
import { Button } from 'native-base';

export default function Login(props) {
    const [loginError, setLoginError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [changed, setChanged] = useState(false);

    const loginValidationSchema = yup.object().shape({
        email: yup
            .string()
            .email('Please enter valid email')
            .required('Email Address is Required'),
        password: yup.string().required('Password is required'),
    });

    const { handleSubmit, handleChange, handleBlur, values, errors, touched } = useFormik({
        initialValues: {
            username: "",
            password: "",
        },

        validationSchema: loginValidationSchema,

        async onSubmit(values) {
            setIsLoading(true);
            setChanged(false);
            const response = await fetch(
                'https://assets-managements.herokuapp.com/login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: values.email,
                        password: values.password,
                    }),
                }
            );
            const data = await response.json();
            // alert(data.Message);
            console.log(data);
            if (data.Message === 'LOGIN_SUCCESS') {
                await AsyncStorage.setItem('access_token', data.access_token);
                await AsyncStorage.setItem('id', JSON.stringify(data.data.id))
                if (data.data.role === "admin") {
                    Toast.show('Login Successfull');
                    props.navigation.navigate('AdminDashborad');
                } else {
                    Toast.show('Login Successfull');
                    props.navigation.navigate('UserDashborad');
                }
                console.log(' logged in');
                setIsLoading(false);
                values.email = '';
                values.password = '';
            } else if (data.Message === 'INCORRECT_PASSWORD') {
                console.log('not logged in');
                setLoginError('Incorrect Password');
                Toast.show('Incorrect Password');
                setIsLoading(false);
                values.email = '';
                values.password = '';
            } else {
                console.log('not logged in');
                setLoginError('User Not Found');
                Toast.show('User Not Found');
                setIsLoading(false);
                values.email = '';
                values.password = '';
            }
        }
    });

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS == "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS == "ios" ? 0 : 0}
            enabled={Platform.OS === "ios" ? true : true}
            style={styles.screen}
        >
            <LinearGradient colors={['#020024', '#090979', '#00d4ff']} style={styles.gradient}>
                <View style={styles.card}>
                    <ScrollView keyboardShouldPersistTaps='handled'>
                        <Image
                            style={styles.tinyLogo}
                            source={require('./assets/trackIt.png')}
                        />
                        <>
                            <View>
                                {!changed && ((loginError === "Incorrect Password") || (loginError === "User Not Found")) &&
                                    <Text style={styles.errorText}>{loginError}</Text>
                                }
                            </View>
                            <TextInput
                                mode='outlined'
                                name="email"
                                label="Email Address"
                                style={styles.textInput}
                                onChange={e => {
                                    setChanged(true);
                                    handleChange(e);
                                }}
                                // onBlur={handleBlur('email')}
                                value={values.email}
                                keyboardType="email-address"
                            />
                            {errors.email && touched.email && (
                                <Text style={styles.errorText}>{errors.email}</Text>
                            )}

                            <TextInput
                                mode='outlined'
                                name="password"
                                label="Password"
                                style={styles.textInput}
                                onChange={e => {
                                    setChanged(true);
                                    handleChange(e);
                                }}
                                // onBlur={handleBlur('password')}
                                value={values.password}
                                secureTextEntry
                            />
                            {errors.password && touched.password && (
                                <Text style={styles.errorText}>{errors.password}</Text>
                            )}

                            {isLoading ? (
                                <ActivityIndicator size="large" color="purple" />
                            ) : (
                                <Button
                                    style={[styles.button, styles.buttonOpen]}
                                    onPress={handleSubmit}>
                                    <Text style={styles.textStyle}>Login</Text>
                                </Button>
                            )}


                            <Text style={{ marginTop: '3%', textAlign: 'center' }}>
                                Don't have an Account?{' '}
                                <Text
                                    onPress={() => props.navigation.navigate('Register')}
                                    style={{ color: 'blue' }}>
                                    SignUp
                                </Text>
                            </Text>
                        </>
                    </ScrollView>
                </View>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        paddingTop: Constants.statusBarHeight,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    // img: {
    //   flex: 1,
    //   justifyContent: 'center',
    //   alignItems: 'center'
    // },
    card: {
        shadowColor: 'black',
        shadowOpacity: 0.26,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 5,
        borderRadius: 10,
        backgroundColor: 'white',
        width: '80%',
        maxWidth: 400,
        maxHeight: "90%",
        padding: 20
    },
    textInput: {
        marginHorizontal: 2,
        marginVertical: 5,
    },
    errorText: {
        textAlign: 'center',
        color: 'red',
    },
    button: {
        marginVertical: 5,
        marginTop: 10,
        width: '100%',
        borderRadius: 20,
        color: 'white',
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonOpen: {
        backgroundColor: 'purple',
    },
    tinyLogo: {
        width: 100,
        height: 80,
        marginBottom: '2%',
        marginLeft: "32%",
        padding: 10,
    },
    textStyle: {
        fontWeight: 'bold',
        color: 'white',
    },
});
