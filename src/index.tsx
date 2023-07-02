import React, { useContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface PropTypes {
  keycloakUrl: string
  clientId: string
  children: any
}

interface ApiOptionTypes {
  method: string
  headers: {
    Accept: string
    'Content-Type': string
  }
  body?: string
}

interface TokenObjectTypes {
  access_token: string
  expires_in: number
  refresh_token: string
  refresh_expires_in: number
}

const tokenObjectIV = {
  access_token: '',
  expires_in: 0,
  refresh_token: '',
  refresh_expires_in: 0,
}

const AuthContext = React.createContext({})

const AuthProvider = ({ keycloakUrl, clientId, children }: PropTypes) => {
  const [accessToken, setAccessToken] = useState<string>('')
  const [tokenObject, setTokenObject] =
    useState<TokenObjectTypes>(tokenObjectIV)

  useEffect(() => {
    AsyncStorage.getItem('tokenObject')
      .then((res: any) => {
        const data = JSON.parse(res)
        if (data && data?.access_token) {
          const presentTime = new Date().getTime()
          if (data.expires_in > presentTime) {
            setAccessToken(data.access_token)
            setTokenObject(data)
          } else if (data.refresh_expires_in > presentTime)
            getTokenFromRefresh(data.refresh_token)
        }
      })
      .catch((err) => console.log('err', err))
  }, [])

  const saveTokenData = async (data: any) => {
    const presentTime = new Date().getTime()
    const tempTokenObject = {
      access_token: data.access_token,
      expires_in: presentTime + data.expires_in * 1000,
      refresh_token: data.refresh_token,
      refresh_expires_in: presentTime + data.refresh_expires_in * 1000,
    }
    await AsyncStorage.setItem('tokenObject', JSON.stringify(tempTokenObject))
    setTokenObject(tempTokenObject)
    setAccessToken(data.access_token)
  }

  const loginHandler = async (username: string, password: string) => {
    try {
      const res = await fetch(`${keycloakUrl}/protocol/openid-connect/token`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded',
        },
        body: `client_id=${clientId}&username=${username}&password=${password}&grant_type=password`,
      })
      const data = await res.json()
      if (data?.access_token) {
        await saveTokenData(data)
      }
    } catch (err) {
      console.log('err', err)
    }
  }

  const getTokenFromRefresh = async (refreshProvided?: string) => {
    try {
      const res = await fetch(`${keycloakUrl}/protocol/openid-connect/token`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded',
        },
        body: `client_id=${clientId}&refresh_token=${
          refreshProvided || tokenObject.refresh_token
        }&grant_type=refresh_token`,
      })
      const data = await res.json()
      if (data?.access_token) {
        await saveTokenData(data)
      }
    } catch (err) {
      console.log('err', err)
    }
  }

  const checkOrRefreshToken = async () => {
    const presentTime = new Date().getTime()
    if (tokenObject.expires_in > presentTime) {
    } else if (tokenObject.refresh_expires_in > presentTime) {
      await getTokenFromRefresh()
    } else logoutHandler()
  }

  const apiHelper = async (endpoint: string, body: object, method = 'GET') => {
    await checkOrRefreshToken()
    let options: ApiOptionTypes = {
      method: method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
    if (method == 'POST') {
      options.body = JSON.stringify(body)
    }
    return new Promise((resolve, reject) => {
      fetch(endpoint, options)
        .then((response) => {
          if (response.status == 200) {
            response
              .json()
              .then((res) => {
                resolve(res)
              })
              .catch((error) => {
                console.log('error from apihelpers', response)
                console.error(error)
                reject(error)
              })
          } else {
            console.log('response not 200 from apihelpers', response)
            reject(response)
          }
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  const logoutHandler = () => {
    AsyncStorage.removeItem('tokenObject')
      .then(() => {
        setTokenObject(tokenObjectIV)
        setAccessToken('')
      })
      .catch((err) => console.log('err', err))
  }

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        loginHandler,
        apiHelper,
        checkOrRefreshToken,
        logoutHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext: any = () => useContext(AuthContext)

export default AuthProvider
