import React, { useEffect } from 'react'
import AuthProvider from 'appfactory-react-mobile'

import Home from './home'
import { Text, View } from 'react-native'

const App = () => {
  return (
    <AuthProvider
      keycloakUrl={'https://keycloak.college.dev.campuschamp.io/realms/rasc'}
      clientId={'rasc-apis'}
    >
      <Home />
    </AuthProvider>
  )
}

export default App
