import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  RefreshControl,
  Image,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { firestore, auth } from "../firebase";
import { AuthContext } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../constants";

const ChatScreen = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [requester, setRequester] = useState(null);

  const route = useRoute();
  const { userId, workerId } = route.params;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!user || (!userId && !workerId)) {
      console.error("User or ID parameters missing.");
      return;
    }

    const fetchRequesterData = async () => {
      const requesterDoc = await firestore
        .collection("users")
        .doc(user?.role==="user" ? workerId : userId)
        .get();
      if (requesterDoc.exists) {
        setRequester(requesterDoc.data());
      }
    };
    fetchRequesterData();
  
    const fetchMessages = async () => {
      const chatCollection = user.role === "user" ? workerId : userId;
      const snapshot = await firestore
        .collection("chats")
        .doc(user.uid)
        .collection(chatCollection)
        .orderBy("createdAt", "desc")
        .get();
  
      const messages = snapshot.docs.map((doc) => ({
        _id: doc.id,
        text: doc.data().text,
        createdAt: doc.data().createdAt.toDate(),
        user: doc.data().user,
        receiver: doc.data().receiver,
      }));
  
      setMessages(messages);
    };
  
    fetchMessages();
  
    const unsubscribe = firestore
      .collection("chats")
      .doc(user.uid)
      .collection(user.role === "user" ? workerId : userId)
      .orderBy("createdAt", "desc")
      .onSnapshot((querySnapshot) => {
        const messages = querySnapshot.docs.map((doc) => ({
          _id: doc.id,
          text: doc.data().text,
          createdAt: doc.data().createdAt.toDate(),
          user: doc.data().user,
          receiver: doc.data().receiver,
        }));
        setMessages(messages);
      });
  
    return () => unsubscribe();
  }, [user, userId, workerId]);
  

  const sendMessage = async (autoMessage) => {
    const messageText = autoMessage || message;
    if (messageText.trim().length > 0 && requester) {
      const messageData = {
        text: messageText,
        createdAt: new Date(),
        user: {
          _id: user.uid,
          name: user.username,
        },
        receiver: {
          _id: requester.uid,
          name: requester.username,
        },
      };

      try {
        await firestore
          .collection("chats")
          .doc(user.uid)
          .collection(user?.role==="user" ? workerId : userId)
          .add(messageData);

        await firestore
          .collection("chats")
          .doc(user?.role==="user" ? workerId : userId)
          .collection(user.uid)
          .add(messageData);
      } catch (error) {
        console.error("Error adding message to requester chat:", error.message);
      }

      if (!autoMessage) {
        setMessage("");
      }
    }
  };

  const renderMessageItem = ({ item }) => {
    const isCurrentUser = item.user._id === user.uid;

    return (
      <View
        style={{
          padding: 10,
          backgroundColor: isCurrentUser ? "lightblue" : "lightgray",
          margin: 10,
          borderRadius: 20,
          alignSelf: isCurrentUser ? "flex-end" : "flex-start",
          maxWidth: "80%",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        {item.user._id !== user.uid  && <Text className="font-semibold mb-1">{item.user.name}</Text> }
        <Text>{item.text}</Text>
        <Text className="text-xs text-gray-500 text-right mt-2">{item.createdAt.toLocaleString()}</Text>
      </View>
    )
  }

  useEffect(() => {
      if (route.params?.sendAutoMessage && requester) {
          sendMessage(`Hai, saya akan mengambil pekerjaan: ${route.params?.jobTitle} Tolong berikan informasi waktu dan tempat untuk pekerjaan ini.`);
      }
  }, [requester]);

  return (
    <SafeAreaView className="bg-primary" style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
          <View className="justify-between" style={{ flex: 1 }}>
            <View className="flex-row items-center bg-primary border-b border-gray-300 p-3">
              {requester?.profilePicture ? (
                <Image
                  source={{ uri: requester.profilePicture }}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                />
              ) : (
                <Image
                  source={images.profile}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                />
              )}
              <Text className="text-white font-semibold" style={{ marginLeft: 10, fontSize: 18 }}>
                {requester?.username}
              </Text>
            </View>
            <FlatList
              data={messages}
              renderItem={renderMessageItem}
              keyExtractor={(item) => item._id}
              inverted
              contentContainerStyle={{ flexGrow: 1 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => {}} />
              }
            />
            <View className={`flex-row justify-end items-center bottom-0 w-full h-16`}>
              <TextInput
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                placeholder="Ketik pesan..."
                placeholderTextColor="white"
                className="w-full h-16 border-gray-300 border-t bg-primary p-1 text-white"
                style={{ paddingHorizontal: 10 }}
              />
              <TouchableOpacity
                className="absolute pr-2"
                onPress={() => sendMessage()}
                activeOpacity={0.7}
              >
                <Image source={images.send} className="h-7 w-7" />
              </TouchableOpacity>
            </View>
          </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
