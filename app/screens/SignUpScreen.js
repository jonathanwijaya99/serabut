import { View, Text, ScrollView, Image, Alert, StyleSheet } from 'react-native'
import { React, useState }from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link } from 'expo-router'
import { images } from '../constants'
import FormField from '../components/FormField'
import CustomButton from '../components/CustomButton'
import { auth, firestore } from '../firebase'
import { doc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [form, setform] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
  })
  const [isSubmitting, setisSubmitting] = useState(false)

  const handleSignUp = async () => {
    if (!form.role || !form.username || !form.email || !form.password) {
      Alert.alert('Error', 'Semua Data Harus Di Lengkapi!');
      return;
    }

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(form.email, form.password);
      const { user } = userCredential;
      await firestore.collection('users').doc(user.uid).set({
        uid: user.uid,
        username: form.username,
        email: form.email,
        role: form.role,
      });
      navigation.navigate('screens/HomeScreen');
    } catch (error) {
      console.error(error);
    }
  }
  
  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center items-center h-full px-4 my-6">
          <Image
            source={images.logoLight}
            resizeMode='contain'
            className="w-[115px] h-[35px]"
          />
          <Text className="text-2xl text-white text-semibold mt-10 font-psemibold">Buat Akun</Text>
          <FormField
            title="Username"
            value={form.username}
            handleChangeText={(e) => setform({...form, username: e})}
            style="mt-7"
          />
          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setform({...form, email: e})}
            style="mt-7"
            keyboardType="email-address"
          />
          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setform({...form, password: e})}
            style="mt-7"
          />

          <View className="w-full mt-7">
            <Text className="text-base text-gray-100 font-pmedium text-center mb-2">Daftar Sebagai?</Text>
            <View className="w-full flex-row justify-between">
              <CustomButton
                title="Pengguna"
                handlePress={(e) => setform({...form, role: form.role === 'user' ? '' : 'user'})}
                className="w-1/3"
                style={{backgroundColor: '#8cae4f'}}
                isLoading={form.role === "worker" ? true : false}
              />
              <CustomButton
                title="Pekerja"
                handlePress={(e) => setform({...form, role: form.role === 'worker' ? '' : 'worker'})}
                className="w-1/3"
                style={{backgroundColor: '#8cae4f'}}
                isLoading={form.role === "user" ? true : false}
              />
            </View>
          </View>
          <CustomButton
            title="Buat Akun"
            handlePress={handleSignUp}
            className="w-full mt-7"
            style={{backgroundColor: '#8cae4f'}}
            isLoading={isSubmitting}
          />

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">Sudah punya akun?</Text>
            <Link href="screens/LoginScreen" className='text-lg font-psemibold text-secondary'>Masuk</Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignUpScreen

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
}})