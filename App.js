import React, { useState, useEffect } from "react";
import { AsyncStorage, View, Alert } from "react-native";
import firebase from "react-native-firebase";
import { WebView } from "react-native-webview";
const host = "https://92a17d93fff6.ngrok.io";

export default function App() {
  const [uri, setUri] = useState(host);
  useEffect(() => {
    checkPermission();
    createNotificationListeners();
  }, []);

  //1
  async function checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      getToken();
    } else {
      requestPermission();
    }
  }

  //3
  async function getToken() {
    let fcmToken = await AsyncStorage.getItem("fcmToken");
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        // user has a device token
        await AsyncStorage.setItem("fcmToken", fcmToken);
      }
    }
  }

  //2
  async function requestPermission() {
    try {
      await firebase.messaging().requestPermission();
      // User has authorised
      getToken();
    } catch (error) {
      // User has rejected permissions
      console.log("permission rejected");
    }
  }

  async function createNotificationListeners() {
    // This listener triggered when notification has been received in foreground
    notificationListener = firebase
      .notifications()
      .onNotification((notification) => {
        const { title, body } = notification;
        displayNotification(title, body);
      });

    // This listener triggered when app is in backgound and we click, tapped and opened notifiaction
    notificationOpenedListener = firebase
      .notifications()
      .onNotificationOpened((notificationOpen) => {
        const { title, body } = notificationOpen.notification;
        displayNotification(title, body);
      });

    // This listener triggered when app is closed and we click,tapped and opened notification
    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpen) {
      const { title, body } = notificationOpen.notification;
      displayNotification(title, body);
    }
  }

  function displayNotification(title, body) {
    Alert.alert(
      title,
      body,
      [{ text: "Ok", onPress: () => console.log("ok pressed") }],
      { cancelable: false }
    );
  }

  async function navigationStateChangeHandler(state) {
    const isAuthRoutes = ["sign_in", "sign_up"].some((route) =>
      state?.url.includes(route)
    );

    const fcmToken = await AsyncStorage.getItem("fcmToken");

    fcmToken &&
      isAuthRoutes &&
      setUri(`${host}/users/save_token?token=${fcmToken}`);
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        startInLoadingState={true}
        source={{
          uri: uri,
        }}
        onNavigationStateChange={navigationStateChangeHandler}
        style={{ flex: 1 }}
      />
    </View>
  );
}
