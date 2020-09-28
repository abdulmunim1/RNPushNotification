import React, { useState, useEffect, useRef } from "react";
import { AsyncStorage, ActivityIndicator, View } from "react-native";
import firebase from "react-native-firebase";
import { WebView } from "react-native-webview";
const host = "https://morning-badlands-40082.herokuapp.com/";

export default function App() {
  const [uri, setUri] = useState(host);
  const webViewRef = useRef(null);

  useEffect(() => {
    checkPermission();
    // createNotificationListeners();
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
    if (!!fcmToken && !isAuthRoutes) {
      setUri(`${host}/users/save_token?token=${fcmToken}`);
    }
    if (isAuthRoutes) {
      setUri(state.url);
    }
  }

  async function createNotificationListeners() {
    // This listener triggered when notification has been received in foreground
    firebase.notifications().onNotification((notification) => {
      webViewRef.current.reload();
    });

    firebase.notifications().onNotificationOpened((notificationOpen) => {
      webViewRef.current.reload();
    });

    // This listener triggered when app is closed and we click,tapped and opened notification
    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpen) {
      webViewRef.current.reload();
    }
  }
  return (
    <WebView
      ref={webViewRef}
      startInLoadingState={true}
      renderLoading={() => <Loader />}
      source={{
        uri: uri,
      }}
      onNavigationStateChange={navigationStateChangeHandler}
      style={{ flex: 1 }}
    />
  );
}

function Loader() {
  return (
    <View
      style={{
        position: "absolute",
        top: "50%",
        left: "45%",
      }}
    >
      <ActivityIndicator color="teal" size="large" />
    </View>
  );
}
