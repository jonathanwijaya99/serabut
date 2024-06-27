import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';

const Stack = createNativeStackNavigator();

const HomeStack = () => {
    return (
      <Stack.Navigator>
        <Stack.Screen name="screens/HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    );
};

export default HomeStack