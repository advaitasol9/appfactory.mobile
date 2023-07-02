import React, { useEffect } from 'react'
import { View, Text } from 'react-native'
import { useAuthContext } from 'appfactory-react-mobile'

const Home = () => {
  const { loginHandler } = useAuthContext()
  useEffect(() => {
    console.log('loginHandler', loginHandler)
  }, [])
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home</Text>
    </View>
  )
}

export default Home
