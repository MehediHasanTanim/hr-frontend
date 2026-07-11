// mobile/App.tsx — Sprint 12 F3: React Native Mobile App Entry
// NOTE: Per spec §8 open question #3 — Expo managed workflow chosen pending confirmation.
// Token storage: expo-secure-store (never AsyncStorage for tokens).
// Offline: No mutation queueing in V1 — forms disabled when offline via NetInfo.

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";

// ─── Screens (scaffolded — implement per sprint scope) ──────────
// Auth screens
// import { LoginScreen } from "./screens/auth/LoginScreen";
// import { ForgotPasswordScreen } from "./screens/auth/ForgotPasswordScreen";
// import { BiometricUnlockScreen } from "./screens/auth/BiometricUnlockScreen";

// Main tab screens
// import { HomeScreen } from "./screens/main/HomeScreen";
// import { LeaveScreen } from "./screens/main/LeaveScreen";
// import { PayslipsScreen } from "./screens/main/PayslipsScreen";
// import { NotificationsScreen } from "./screens/main/NotificationsScreen";

// ─── Navigation types ───────────────────────────────────────────
export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  BiometricUnlock: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Leave: undefined;
  Payslips: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000 },
    mutations: { retry: 1 },
  },
});

// Placeholder screens until full implementation
function PlaceholderScreen({ name }: { name: string }) {
  const { View, Text, StyleSheet } = require("react-native");
  return (
    <View style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center" }]}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>{name}</Text>
      <Text style={{ marginTop: 8, color: "#666" }}>Coming in Sprint 12</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen name="Home" component={() => <PlaceholderScreen name="Home (ESS)" />} />
      <Tab.Screen name="Leave" component={() => <PlaceholderScreen name="Leave" />} />
      <Tab.Screen name="Payslips" component={() => <PlaceholderScreen name="Payslips" />} />
      <Tab.Screen name="Notifications" component={() => <PlaceholderScreen name="Notifications" />} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={() => <PlaceholderScreen name="Login" />} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </QueryClientProvider>
  );
}
