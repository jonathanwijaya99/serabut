import { View, Text, ScrollView, Image } from 'react-native'
import { React, useState }from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link } from 'expo-router'
import { images } from '../constants'
import { auth } from '../firebase'
import FormField from '../components/FormField'
import CustomButton from '../components/CustomButton'
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setisSubmitting] = useState(false)

  const handleLogin = async () => {
    setisSubmitting(true)
    try {
      await auth.signInWithEmailAndPassword(email, password);
      navigation.navigate('screens/HomeScreen');
      setisSubmitting(false)
    } catch (error) {
      console.error(error);
      setisSubmitting(false)
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center items-center h-full px-4 my-6">
          <Image
            source={images.logoLight}
            resizeMode='contain'
            className="w-[115px] h-[35px]"
          />
          <Text className="text-2xl text-white text-semibold mt-10 font-psemibold">Masuk</Text>

          <FormField
            title="Email"
            value={email}
            handleChangeText={(e) => setEmail(e)}
            style="mt-7"
            keyboardType="email-address"
          />
          <FormField
            title="Password"
            value={password}
            handleChangeText={(e) => setPassword(e)}
            style="mt-7"
          />

          <CustomButton
            title="Masuk"
            handlePress={handleLogin}
            className="w-full mt-7"
            style={{backgroundColor: '#8cae4f'}}
            isLoading={isSubmitting}
          />

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">Tidak punya akun?</Text>
            <Link href="screens/SignUpScreen" className='text-lg font-psemibold text-secondary'>Daftar</Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default LoginScreen