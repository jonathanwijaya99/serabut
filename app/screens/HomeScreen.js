import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, Modal, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { firestore } from '../firebase';
import CustomButton from '../components/CustomButton';
import Checkbox from 'expo-checkbox';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import haversine from 'haversine-distance';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [refreshing, setRefreshing] = React.useState(false);

  const [jobOffers, setJobOffers] = useState([]);
  const [jobHistory, setJobHistory] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [requestDetails, setRequestDetails] = useState({
    jobTitle: '',
    description: '',
    location: '',
    payment: '',
    isNegotiable: false
  });
  const [errors, setErrors] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [userLocationText, setUserLocationText] = useState('');
  const [selectedJobRequest, setSelectedJobRequest] = useState(null);
  const [jobModalVisible, setJobModalVisible] = useState(false);
  const [confirmCompleteModalVisible, setConfirmCompleteModalVisible] = useState(false);
  const [workerLocation, setWorkerLocation] = useState(null)
  const [distance, setDistance] = useState(null)

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  useEffect(() => {
    if (user) {
      const fetchJobOffers = async () => {
        if (user?.role === 'worker') {
          const snapshot = await firestore.collection('workRequests').where('status', '==', 'pending').get();
          const offers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setJobOffers(offers);
        }
      };

      const fetchJobHistory = async () => {
        if(user?.role === "user"){
              const snapshot = await firestore.collection('workRequests').where('userId', '==', user.uid).get();
              const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              setJobHistory(history);
        } else if(user?.role === "worker") {
            const snapshot = await firestore.collection('workRequests').where('workerId', '==', user.uid).get();
            const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setJobHistory(history);
        }
      };

      fetchJobOffers();
      fetchJobHistory();
    }
  }, [user, refreshing]);

  const validateForm = () => {
    let valid = true;
    let errors = {};

    if (!requestDetails.description) {
      valid = false;
      errors.description = 'Deskripsi Wajib Di Isi!';
    }

    if (!requestDetails.jobTitle) {
      valid = false;
      errors.jobTitle = 'Judul Pekerjaan Wajib Di Isi!';
    }

    if (!requestDetails.payment) {
      valid = false;
      errors.payment = 'Bayaran Wajib Di Isi!';
    }

    setErrors(errors);
    return valid;
  };

  const handleRequestSubmit = async () => {
    if (!validateForm()) {
      return;
    }
  
    try {
      const requestWithLocation = { ...requestDetails, location: userLocation };

      await firestore.collection('workRequests').add({
        userId: user.uid,
        requestDetails: requestWithLocation,
        timeSubmitted: new Date(),
        status: 'pending',
      })
      setModalVisible(false);
      setRequestDetails({
        jobTitle: '',
        description: '',
        location: '',
        payment: '',
        isNegotiable: false
      });
    } catch (error) {
      console.error('Error submitting request:', error.message);
    }
  };

  const handleCancelJobRequest = async (jobRequest) => {
    try {
      await firestore.collection('workRequests').doc(jobRequest.id).update({
        status: 'canceled',
      });
      setJobModalVisible(false);
    } catch (error) {
      console.error('Error canceling job request:', error.message);
    }
  };

  const handleTakeJobRequest = async (jobRequest) => {
    console.log(jobRequest)
    try {
      await firestore.collection('workRequests').doc(jobRequest.id).update({
        status: 'wip',
        workerId: user.uid
      });

      setJobModalVisible(false)
      navigation.navigate('screens/ChatScreen', { userId: jobRequest?.userId, jobTitle: jobRequest.requestDetails.jobTitle, sendAutoMessage: true});
    } catch (error) {
      console.error('Error updating job request:', error.message);
    }
  };

  const handleCompleteJobRequest = async (jobRequest) => {
    try {
      await firestore
        .collection("workRequests")
        .doc(jobRequest.id)
        .update({ status: "completed" });
  
      setJobModalVisible(false);
      setConfirmCompleteModalVisible(false);
    } catch (error) {
      console.error("Error completing job request:", error);
    }
  };

  const getDistance = (workerLocation, jobLocationString) => {
    if(user?.role === "worker"){
      const jobLocationArray = jobLocationString?.split(',').map(parseFloat);
      const jobLocation = {
        latitude: jobLocationArray[0],
        longitude: jobLocationArray[1]
      };
    
      const start = {
        latitude: workerLocation.latitude,
        longitude: workerLocation.longitude
      };
    
      const end = {
        latitude: jobLocation.latitude,
        longitude: jobLocation.longitude
      };

      const calcDistance = haversine(start, end);
      setDistance(calcDistance)
    }
  };

  const getWorkerLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Location permission denied');
        return;
      }
  
      let location = await Location.getCurrentPositionAsync({});
      const workerLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setWorkerLocation(workerLocation)
    } catch (error) {
      console.error('Error getting worker location:', error.message);
    }
  };

  const getLocationFromString = (locationString) => {
    if (!locationString) return null;
    const [latitude, longitude] = locationString?.split(',').map(coord => parseFloat(coord.trim()));
    return { latitude, longitude };
  };

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrors({ location: 'Permission to access location was denied' });
          return;
        }
    
        let location = await Location.getCurrentPositionAsync({});
        setMapRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
    
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.coords.latitude}&lon=${location.coords.longitude}`);
        const data = await response.json();
        const locationDetails = data.address; // Extract relevant location details from OpenStreetMap response
    
        const overpassResponse = await fetch(`https://lz4.overpass-api.de/api/interpreter?data=[out:json];(node(around:500,${location.coords.latitude},${location.coords.longitude});way(around:500,${location.coords.latitude},${location.coords.longitude}););out;`);
        const overpassData = await overpassResponse.json();

        const nearbyPlaces = overpassData.elements
          .filter(element => element.tags && element.tags.name) // Filter elements without 'tags.name' property
          .map(element => element.tags.name);

        // Construct the user location text
        let userLocationText = '';
        if (nearbyPlaces.length > 0) {
          userLocationText = `Near ${nearbyPlaces[0]}`; // Use the first nearby place as an example
        } else {
          if (locationDetails.city) {
            userLocationText += locationDetails.city;
          }
          if (locationDetails.state) {
            userLocationText += (userLocationText.length > 0 ? ', ' : '') + locationDetails.state;
          }
          if (locationDetails.country) {
            userLocationText += (userLocationText.length > 0 ? ', ' : '') + locationDetails.country;
          }
        }
    
        setUserLocationText(userLocationText);
      } catch (error) {
        console.error('Error getting user location:', error.message);
      }
    };

    if(user?.role === "worker") {
      getWorkerLocation();
    } else {
      getUserLocation()
    }
  }, [])

  useEffect(() => {
    if(user?.role === "worker" && workerLocation && selectedJobRequest?.requestDetails.location){
      getDistance(workerLocation, selectedJobRequest?.requestDetails.location)?.toFixed(2)
    }
  },[workerLocation, selectedJobRequest])

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="w-full justify-center px-4">
          <Text className="font-bold text-sm text-gray-100 text-xl">Selamat datang, {user ? user.username : ''}</Text>

          {user && user?.role === 'user' ? (
            <>
              <CustomButton
                title="Cari Pekerja"
                handlePress={() => setModalVisible(true)}
                className="w-full mt-7"
                style={{ backgroundColor: '#8cae4f' }}
              />
              <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
                className="bg-primary"
              >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(28,28,28,0.9)' }}>
                  <View style={{ width: '90%', padding: 20, borderRadius: 10 }} className="bg-primary border-gray-600 border">
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }} className="text-white">Request Worker</Text>
                    <TextInput
                      placeholder="Cari Pekerja Apa?"
                      placeholderTextColor="white"
                      value={requestDetails.jobTitle}
                      onChangeText={(text) => setRequestDetails({ ...requestDetails, jobTitle: text })}
                      style={{ borderBottomWidth: 1, marginBottom: 10 }}
                      className="border-white text-white p-3"
                    />
                    {errors.jobTitle && (
                      <Text style={{ color: 'red' }}>{errors.jobTitle}</Text>
                    )}
                    <TextInput
                      placeholderTextColor="white"
                      multiline
                      numberOfLines={5}
                      placeholder="Deskripsi Pekerjaan"
                      value={requestDetails.description}
                      onChangeText={(text) => setRequestDetails({ ...requestDetails, description: text })}
                      style={{ borderBottomWidth: 1, marginBottom: 10 }}
                      className="border-white text-white p-3"
                    />
                    {errors.description && (
                      <Text style={{ color: 'red' }}>{errors.description}</Text>
                    )}
                    <TextInput
                      placeholder="Lokasi"
                      value={userLocationText}
                      onChangeText={(text) => setUserLocationText(text)}
                      style={{ borderBottomWidth: 1, marginBottom: 10 }}
                      className="border-white text-white p-3"
                    />
                    {errors.location && (
                      <Text style={{ color: 'red' }}>{errors.location}</Text>
                    )}
                    <MapView
                      style={{ height: 300 }}
                      region={mapRegion}
                      onPress={(e) => setUserLocation(`${e.nativeEvent.coordinate.latitude}, ${e.nativeEvent.coordinate.longitude}`)}
                    >
                      {userLocation && (
                        <Marker
                        coordinate={{ latitude: mapRegion.latitude, longitude: mapRegion.longitude }}
                        draggable
                        onDragEnd={(e) => {
                          const newLocation = `${e.nativeEvent.coordinate.latitude}, ${e.nativeEvent.coordinate.longitude}`;
                          setUserLocation(newLocation);
                        }}
                      />
                      )}
                    </MapView>

                    <TextInput
                      placeholder="Payment (Rp)"
                      value={requestDetails.payment}
                      onChangeText={(text) => setRequestDetails({ ...requestDetails, payment: text.replace(/[^0-9]/g, '') })}
                      keyboardType="numeric"
                      style={{ borderBottomWidth: 1, marginBottom: 10 }}
                      className="border-white text-white p-3"
                    />
                    {errors.payment && (
                      <Text style={{ color: 'red' }}>{errors.payment}</Text>
                    )}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                      <Checkbox
                        value={requestDetails.isNegotiable}
                        onValueChange={() => setRequestDetails({ ...requestDetails, isNegotiable: !requestDetails.isNegotiable })}
                      />
                      <Text className="text-white p-3">Bayaran Bisa di Negosiasikan?</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                      <CustomButton
                        unstyled
                        title="Kembali"
                        handlePress={() => {setModalVisible(false); setErrors({})}}
                        className="w-max py-2 px-4 bg-red-500"
                      />
                      <CustomButton
                        unstyled
                        title="Cari Pekerja"
                        handlePress={handleRequestSubmit}
                        className="w-max py-2 px-4"
                        style={{ backgroundColor: '#8cae4f' }}
                      />
                    </View>
                  </View>
                </View>
              </Modal>
            </>
          ) : (
            <View className="items-center w-max">
              <Text className="font-psemibold text-white my-4">Pekerjaan Yang Dibutuhkan:</Text>
              <ScrollView className="w-full">
                <View className="h-max">
                {jobOffers.length > 0 ? (
                  jobOffers.map((offer, index) => ( 
                    <TouchableOpacity key={`job-${index}`} onPress={() => {setSelectedJobRequest(offer); setJobModalVisible(true);}}>
                      <View className="bg-gray-200 rounded p-4 my-2">
                        <View className="flex-row justify-between">
                        <Text className="font-semibold">{offer.requestDetails.jobTitle}</Text>
                        <Text className="text-green-500">Rp. {offer.requestDetails.payment} {offer.requestDetails.isNegotiable ? "(Bisa Nego)" : "Tidak Bisa Nego"}</Text>
                      </View>
                        <Text className="mt-3">{offer.requestDetails.description.substring(0, 50)}...</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text className="font-pregular text-white">Tidak Ada Pekerjaan Saat Ini</Text>
                )}
                </View>
              </ScrollView>
            </View>
          )}
        </View>
        <View className="w-full border-t border-gray-500 my-6" />
        <View className="px-4">
          <Text className="font-psemibold text-white mb-4 font-bold text-lg px-2 border-b border-white">Riwayat Pekerjaan</Text>
          <ScrollView>
            {jobHistory?.length > 0 ? (
              <>
              <View className={`h-max px-4`}>
                {jobHistory.map((job, index) => (
                  <TouchableOpacity key={index} onPress={() => {setSelectedJobRequest(job); setJobModalVisible(true);}}>
                    <View className="bg-gray-200 rounded p-4 my-2">
                      <View className="flex-row justify-between">
                      <Text className="font-semibold">{job.requestDetails.jobTitle}</Text>
                      <Text className="text-green-500">Rp. {job.requestDetails.payment} {job.requestDetails.isNegotiable ? "(Bisa Nego)" : "Tidak Bisa Nego"}</Text>
                    </View>
                      <Text className="mt-3">{job.requestDetails.description.substring(0, 50)}...</Text>
                      <Text className={`text-right mt-3 font-semibold ${job.status === "canceled" ? 'text-red-600' : job.status === "completed" ? 'text-green-600' : 'text-orange-600'}`}>{job.status === "canceled" ? 'Dibatalkan' : job.status === "completed" ? 'Selesai' : 'Sedang Proses'}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              </>
            ) : (
              <View className="flex w-full h-full justify-center items-center">
                <Text className="font-pregular text-white text-center px-8">Mulai {user?.role === "user" ? 'Mencari Pekerja' : 'Mengambil Pekerjaan'} Sekarang, dan Riwayat Transaksi Kamu Akan Tampil Disini!</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </ScrollView>
              <Modal
              animationType="slide"
              transparent={true}
              visible={jobModalVisible}
              onRequestClose={() => {setJobModalVisible(false); setDistance(null)}}
            >
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(28,28,28,0.9)' }}>
                <View style={{ width: '90%', padding: 20, borderRadius: 10 }} className="bg-primary border-gray-600 border">
                  <View className="flex-row">
                    <View>
                      <Text className="text-white" style={{ fontSize: 18, fontWeight: 'bold'}}>{selectedJobRequest?.requestDetails.jobTitle}</Text>
                      <Text className="font-semibold text-green-600 mt-1">Rp. {selectedJobRequest?.requestDetails.payment} {selectedJobRequest?.requestDetails.isNegotiable ? "(Bisa Nego)" : ""}</Text>
                      {user?.role === "worker" && (
                        <Text className="text-gray-300 mt-1">{distance?.toFixed(2)} km Dari Lokasi Anda</Text>
                      )}
                    </View>
                    {
                      (user?.role === "user" && selectedJobRequest?.workerId  && selectedJobRequest?.status === "pending") &&
                      <CustomButton
                        unstyled
                        title="Selesai"
                        handlePress={() => {setJobModalVisible(false); setConfirmCompleteModalVisible(true); setDistance(null)}}
                        className="absolute top-0 right-0 w-max py-2 px-4 bg-green-500"
                      />
                    }
                  </View>
                  
                  <Text className="mt-3 text-white">{selectedJobRequest?.requestDetails.description}</Text>
                  <MapView
                    style={{ width: '100%', height: 200, marginTop: 10 }}
                    initialRegion={{
                      ...getLocationFromString(selectedJobRequest?.requestDetails.location),
                      latitudeDelta: 0.05,
                      longitudeDelta: 0.05,
                    }}
                  >
                    <Marker
                      coordinate={getLocationFromString(selectedJobRequest?.requestDetails.location)}
                      title="Lokasi Pekerjaan"
                    />
                  </MapView>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                    <CustomButton
                      unstyled
                      title="Kembali"
                      handlePress={() => {setJobModalVisible(false); setDistance(null)}}
                      className="w-max py-2 px-4 bg-blue-500"
                    />
                    {(selectedJobRequest?.status !== "canceled" && user?.uid === selectedJobRequest?.userId && !selectedJobRequest?.workerId) &&
                    <CustomButton
                      unstyled
                      title="Batalkan Pencarian"
                      handlePress={() => handleCancelJobRequest(selectedJobRequest)}
                      className="w-max py-2 px-4 bg-red-500"
                    />
                    }
                    {
                      (user?.role === "worker" && !selectedJobRequest?.workerId) &&
                      <CustomButton
                        unstyled
                        title="Ambil Pekerjaan"
                        handlePress={() => handleTakeJobRequest(selectedJobRequest)}
                        className="w-max py-2 px-4 bg-green-500"
                      />
                    }
                    {
                      (user?.role === "worker" && selectedJobRequest?.workerId) &&
                      <CustomButton
                        unstyled
                        title="Chat Client"
                        handlePress={() => {
                            setJobModalVisible(false)
                            setDistance(null)
                            navigation.navigate('screens/ChatScreen', { userId: selectedJobRequest?.userId})
                          }}
                        className="w-max py-2 px-4 bg-green-500"
                      />
                    }
                    {
                      (user?.role === "user" && selectedJobRequest?.workerId) &&
                      <CustomButton
                        unstyled
                        title="Chat Pekerja"
                        handlePress={() => {
                            setJobModalVisible(false)
                            setDistance(null)
                            navigation.navigate('screens/ChatScreen', { workerId: selectedJobRequest?.workerId})
                          }}
                        className="w-max py-2 px-4 bg-green-500"
                      />
                    }
                  </View>
                </View>
              </View>
              </Modal>
              <Modal
                animationType="slide"
                transparent={true}
                visible={confirmCompleteModalVisible}
                onRequestClose={() => setConfirmCompleteModalVisible(false)}
              >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(28,28,28,0.9)' }}>
                  <View style={{ width: '90%', padding: 20, borderRadius: 10 }} className="bg-primary border-gray-600 border">
                    <Text className="text-white" style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>Apa Pekerjaan Ini Sudah Selesai?</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <CustomButton
                        unstyled
                        title="Kembali"
                        handlePress={() => {setJobModalVisible(true); setDistance(null); setConfirmCompleteModalVisible(false)}}
                        className="w-max py-2 px-4 bg-red-500"
                      />
                      <CustomButton
                        unstyled
                        title="Selesai"
                        handlePress={() => handleCompleteJobRequest(selectedJobRequest)}
                        className="w-max py-2 px-4 bg-green-500"
                      />
                    </View>
                  </View>
                </View>
              </Modal>

    </SafeAreaView>
  );
};

export default HomeScreen;
