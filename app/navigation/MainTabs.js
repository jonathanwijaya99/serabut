import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import ProfileScreen from '../screens/ProfileScreen';
import HomeStack from './HomeStack';
import { home } from '../constants/icons'
import { View, Text, Button, ScrollView, Image } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabIcon = ({icon, color, name, focused}) => {
  return (
    <View className="items-center gap-1">
      <Image
        source={icon}
        resizeMode='contain'
        tintColor={color}
        className="w-6 h-6"
      />
      <Text className={`${focused ? 'font-psemibold' : 'font-pregular'} text-xs`} style={{color: color}}>{name}</Text>
    </View>
  )
}

const MainTabs = () => {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
  
            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'Profile') {
              iconName = 'person';
            }
  
            return <MaterialIcons name={iconName} size={size} color={color} />;
          },
        })}
        tabBarOptions={{
          activeTintColor: 'green',
          inactiveTintColor: 'gray',
        }}
      >
        <Tab.Screen
          name="navigation/HomeStack"
          component={HomeStack}
          options={{
            title: 'Home',
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
              <TabIcon 
              icon={home}
              color={color}
              focused={focused}
              />
            )
          }}
        />
        <Tab.Screen
          name="screens/ProfileScreen"
          component={ProfileScreen}
          options={{
            title: 'Profile',
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
              <TabIcon 
              icon={home}
              color={color}
              focused={focused}
              />
            )
          }}
        />
      </Tab.Navigator>
    );
};

export default MainTabs
  