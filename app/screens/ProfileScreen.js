import React, { useContext, useState } from 'react';
import { View, Text, Button, SafeAreaView, Image, Modal, TouchableOpacity, } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { images } from '../constants';
import CustomButton from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, firestore } from '../firebase'

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigation.navigate('screens/LandingScreen')
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  const handleMenuItemPress = (menuItem) => {
    switch (menuItem) {
      case 'PersonalInfo':
        console.log("clicked")
        break;
      case 'About':
        console.log("clicked")
        break;
      case 'Settings':
        console.log("clicked")
        break;
      default:
        break;
    }
  };

  const uploadImageToFirebase = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileName = uri.substring(uri.lastIndexOf('/') + 1);
    const storageRef = ref(storage, `profile_pictures/${user.uid}/${fileName}`);

    const snapshot = await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Update the user's profile picture URL in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, { profilePicture: downloadURL });

    setProfilePicture(downloadURL);
    setModalVisible(false);
  };

  const pickImage = async () => {
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (result.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      await uploadImageToFirebase(pickerResult.assets[0].uri);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
    <View className="w-full justify-center items-center h-2/6 px-4 border-b border-gray-300">
      <Image source={user?.profilePicture || images.profile} className="rounded-full w-28 h-28"/>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Text className="text-white">Ganti Foto Profil</Text>
      </TouchableOpacity>
      <Text className="text-white text-2xl font-bold mt-3">{user?.username}</Text>
      <Text className="text-white font-bold mt-1">Email: {user?.email}</Text>
    </View>
    <View className="w-full h-4/6 bg-primary">
      {/* <TouchableOpacity className="border-y border-gray-300 p-5" onPress={() => handleMenuItemPress('PersonalInfo')}>
        <Text className="text-white text-left text-base">Atur Informasi Pribadi</Text>
      </TouchableOpacity>
      <TouchableOpacity className="border-b border-gray-300 p-5" onPress={() => handleMenuItemPress('About')}>
        <Text className="text-white text-left text-base">Tentang Aplikasi</Text>
      </TouchableOpacity> */}
    <CustomButton
        title="Keluar"
        handlePress={handleLogout}
        className="w-2/4 mt-7 absolute bottom-0 mb-5 self-center"
        style={{backgroundColor: '#8cae4f'}}
      />
    </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ width: '80%', padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
            <Text style={{ fontSize: 18, marginBottom: 20 }}>Ganti Foto Profil</Text>
            <TouchableOpacity onPress={() => pickImage}>
              <Text style={{ color: 'blue' }}>Pilih Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 20 }}>
              <Text style={{ color: 'red' }}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileScreen;
