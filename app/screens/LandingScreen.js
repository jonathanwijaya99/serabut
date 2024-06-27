import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../constants';
import CustomButton from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';

const LandingScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView contentContainerStyle={{height: '100%'}}>
        <View className="w-full justify-center items-center h-full px-4">
          <Image
            source={images.logoLight}
            className="w-[130px] h-[84px]"
            resizeMode='contain'
          />
          <Image
            source={images.landing}
            className="max-w-[380px] w-full h-[300px]"
            resizeMode='contain'
          />

          <View className="relative mt-5">
            <Text className="text-3xl text-white font-bold text-center">
              Satu aplikasi untuk semua pekerjaan anda: {' '}
              <Text style={{color: '#9abf57'}}>Serabut</Text>
            </Text>

            <Image
              source={images.path}
              className="w-[136px] h-[15px] absolute -bottom-2 -right-0"
              resizeMode='contain'
            />
          </View>

          <Text className="text-sm font-pregular text-gray-100 mt-7 text-center">
          <Text style={{color: '#9abf57'}}> Serabut </Text>menghubungkan anda dengan para pekerja terampil.
          </Text>
          <CustomButton
            title="Masuk"
            handlePress={() => navigation.navigate('screens/LoginScreen')}
            className="w-full mt-7"
            style={{backgroundColor: '#8cae4f'}}
          />
        </View>
      </ScrollView>
      <StatusBar backgroundColor='#161622' style='light'/>
    </SafeAreaView>
  );
}

export default LandingScreen