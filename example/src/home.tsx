import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useAuthContext } from 'appfactory-react-mobile'

const Home = () => {
  const { loginHandler } = useAuthContext()

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity onPress={() => loginHandler('', '')}>
        <Text>Login</Text>
      </TouchableOpacity>
    </View>
  )
}

export default Home
