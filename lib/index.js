import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const tokenObjectIV = {
    access_token: '',
    expires_in: 0,
    refresh_token: '',
    refresh_expires_in: 0,
};
const ToastIV = {
    type: '',
    message: '',
};
const AuthContext = React.createContext({});
const AuthProvider = ({ keycloakUrl, clientId, children }) => {
    const [accessToken, setAccessToken] = useState('');
    const [tokenObject, setTokenObject] = useState(tokenObjectIV);
    const [toast, setToast] = useState(ToastIV);
    useEffect(() => {
        if (toast.message)
            setTimeout(() => setToast(ToastIV), 1000);
    }, [toast]);
    useEffect(() => {
        AsyncStorage.getItem('tokenObject')
            .then((res) => {
            const data = JSON.parse(res);
            if (data && (data === null || data === void 0 ? void 0 : data.access_token)) {
                const presentTime = new Date().getTime();
                if (data.expires_in > presentTime) {
                    setAccessToken(data.access_token);
                    setTokenObject(data);
                }
                else if (data.refresh_expires_in > presentTime)
                    getTokenFromRefresh(data.refresh_token);
            }
        })
            .catch((err) => console.log('err', err));
    }, []);
    const saveTokenData = async (data) => {
        const presentTime = new Date().getTime();
        const tempTokenObject = {
            access_token: data.access_token,
            expires_in: presentTime + data.expires_in * 1000,
            refresh_token: data.refresh_token,
            refresh_expires_in: presentTime + data.refresh_expires_in * 1000,
        };
        await AsyncStorage.setItem('tokenObject', JSON.stringify(tempTokenObject));
        setTokenObject(tempTokenObject);
        setAccessToken(data.access_token);
    };
    const loginHandler = async (username, password) => {
        try {
            const res = await fetch(`${keycloakUrl}/protocol/openid-connect/token`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded',
                },
                body: `client_id=${clientId}&username=${username}&password=${password}&grant_type=password`,
            });
            const data = await res.json();
            if (data === null || data === void 0 ? void 0 : data.access_token) {
                await saveTokenData(data);
            }
            else if ((data === null || data === void 0 ? void 0 : data.error) == 'invalid_grant')
                setToast({ type: 'error', message: 'Invalid credentials' });
            else
                setToast({ type: 'error', message: 'Error!' });
        }
        catch (err) {
            if ((err === null || err === void 0 ? void 0 : err.error) == 'invalid_grant')
                setToast({ type: 'error', message: 'Invalid credentials' });
            else
                setToast({ type: 'error', message: 'Error!' });
            console.log('err', err);
        }
    };
    const getTokenFromRefresh = async (refreshProvided) => {
        try {
            const res = await fetch(`${keycloakUrl}/protocol/openid-connect/token`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded',
                },
                body: `client_id=${clientId}&refresh_token=${refreshProvided || tokenObject.refresh_token}&grant_type=refresh_token`,
            });
            const data = await res.json();
            if (data === null || data === void 0 ? void 0 : data.access_token) {
                await saveTokenData(data);
            }
            else
                setToast({ type: 'error', message: 'Error!' });
        }
        catch (err) {
            setToast({ type: 'error', message: 'Error!' });
            console.log('err', err);
        }
    };
    const checkOrRefreshToken = async () => {
        const presentTime = new Date().getTime();
        if (tokenObject.expires_in > presentTime) {
        }
        else if (tokenObject.refresh_expires_in > presentTime) {
            await getTokenFromRefresh();
        }
        else
            logoutHandler();
    };
    const apiHelper = async (endpoint, body, method = 'GET') => {
        await checkOrRefreshToken();
        let options = {
            method: method,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        };
        if (method == 'POST') {
            options.body = JSON.stringify(body);
        }
        return new Promise((resolve, reject) => {
            fetch(endpoint, options)
                .then((response) => {
                if (response.status == 200) {
                    response
                        .json()
                        .then((res) => {
                        resolve(res);
                    })
                        .catch((error) => {
                        console.log('error from apihelpers', response);
                        console.error(error);
                        reject(error);
                    });
                }
                else {
                    console.log('response not 200 from apihelpers', response);
                    reject(response);
                }
            })
                .catch((error) => {
                reject(error);
            });
        });
    };
    const logoutHandler = () => {
        AsyncStorage.removeItem('tokenObject')
            .then(() => {
            setTokenObject(tokenObjectIV);
            setAccessToken('');
            setToast({ type: 'error', message: 'Session expired!' });
        })
            .catch((err) => console.log('err', err));
    };
    return (React.createElement(AuthContext.Provider, { value: {
            accessToken,
            loginHandler,
            apiHelper,
            checkOrRefreshToken,
            logoutHandler,
        } },
        children,
        !!toast.message && (React.createElement(View, { style: [
                styles.toastContainer,
                { backgroundColor: toast.type == 'error' ? '#CD5C5C' : '#228b22' },
            ] },
            React.createElement(Text, { style: styles.toastText }, toast.message)))));
};
const styles = StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        top: 10,
        height: 40,
        width: '90%',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    toastText: {
        color: '#FFF',
        fontSize: 16,
    },
});
export const useAuthContext = () => useContext(AuthContext);
export default AuthProvider;
//# sourceMappingURL=index.js.map