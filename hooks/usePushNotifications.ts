import { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Basic handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export function usePushNotifications() {
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>(undefined);
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
    const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
    const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

    useEffect(() => {
        registerForPushNotificationsAsync()
            .then(token => setExpoPushToken(token))
            .catch(error => console.log("Failed to register for push notifications:", error));

        notificationListener.current = Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
            console.log(response);
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    return {
        expoPushToken,
        notification,
    };
}

async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        try {
            const executionEnvironment = Constants.executionEnvironment;
            // Check if running in Expo Go (StoreClient)
            // 'storeClient' corresponds to ExecutionEnvironment.StoreClient which is "storeClient"
            if (executionEnvironment === 'storeClient') {
                console.log("Push notifications are not supported in Expo Go. Skipping registration.");
                return;
            }
        } catch (e) {
            console.log("Error checking execution environment:", e);
        }

        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }
        // Learn more about projectId:
        // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
        try {
            const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
            if (!projectId) {
                token = (await Notifications.getExpoPushTokenAsync()).data;
            } else {
                token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
            }
            console.log("Push Token:", token);
        } catch (e) {
            console.log("Error fetching token:", e);
            token = (await Notifications.getExpoPushTokenAsync()).data;
        }
    } else {
        // console.log('Must use physical device for Push Notifications');
    }

    return token;
}
