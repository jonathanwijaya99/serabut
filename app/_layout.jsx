import React, { useContext } from 'react';
import { AuthProvider  } from './context/AuthContext';
import MainNavigator from './navigation/MainNavigator'

const App = () => {

  return (
    <AuthProvider>
      <MainNavigator />
    </AuthProvider>
  )
};

export default App;
