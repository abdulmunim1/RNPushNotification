import React, { Component } from "react";
import { AsyncStorage, View, Text } from "react-native";
import firebase from "react-native-firebase";

export default class App extends Component {
  async componentDidMount() {
    this.checkPermission();
    this.createNotificationListeners();
  }

  //1
  async checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      this.getToken();
    } else {
      this.requestPermission();
    }
  }

  //3
  async getToken() {
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
  async requestPermission() {
    try {
      await firebase.messaging().requestPermission();
      // User has authorised
      this.getToken();
    } catch (error) {
      // User has rejected permissions
      console.log("permission rejected");
    }
  }

  async createNotificationListeners() {
    // This listener triggered when notification has been received in foreground
    this.notificationListener = firebase
      .notifications()
      .onNotification((notification) => {
        const { title, body } = notification;
        this.displayNotification(title, body);
      });

    // This listener triggered when app is in backgound and we click, tapped and opened notifiaction
    this.notificationOpenedListener = firebase
      .notifications()
      .onNotificationOpened((notificationOpen) => {
        const { title, body } = notificationOpen.notification;
        this.displayNotification(title, body);
      });

    // This listener triggered when app is closed and we click,tapped and opened notification
    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpen) {
      const { title, body } = notificationOpen.notification;
      this.displayNotification(title, body);
    }
  }

  displayNotification(title, body) {
    // we display notification in alert box with title and body
    Alert.alert(
      title,
      body,
      [{ text: "Ok", onPress: () => console.log("ok pressed") }],
      { cancelable: false }
    );
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Text>Welcome to React Native!</Text>
      </View>
    );
  }
}
