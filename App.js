import React, { useState, useEffect } from "react";
import { AsyncStorage, View } from "react-native";
import firebase from "react-native-firebase";
import { WebView } from "react-native-webview";
const host = "https://dc2641d4e4e0.ngrok.io";

export default function App() {
  const [uri, setUri] = useState(host);
  useEffect(() => {
    checkPermission();
  }, []);

  async function checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      getToken();
    } else {
      requestPermission();
    }
  }

  async function getToken() {
    let fcmToken = await AsyncStorage.getItem("fcmToken");
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        await AsyncStorage.removeItem("fcmToken");
        await AsyncStorage.setItem("fcmToken", fcmToken);
      }
    }
  }

  async function requestPermission() {
    try {
      await firebase.messaging().requestPermission();
      getToken();
    } catch (error) {
      console.log("permission rejected");
    }
  }

  async function navigationStateChangeHandler(state) {
    const isAuthRoutes = ["sign_in", "sign_up"].some((route) =>
      state.url.includes(route)
    );
    const fcmToken = await AsyncStorage.getItem("fcmToken");
    if(!!fcmToken && !isAuthRoutes){
      setUri(`${host}/users/save_token?token=${fcmToken}`);
    }
    if(isAuthRoutes){
      setUri(state.url)
    }
  }

  return (
      <WebView
        source={{
          uri: uri,
        }}
        onNavigationStateChange={navigationStateChangeHandler}
        style={{ flex: 1 }}
      />
  );
}
