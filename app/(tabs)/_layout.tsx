import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // 탭바 완전히 숨김
      }}
    >
      <Tabs.Screen name="calendar" />
      <Tabs.Screen name="wishlist" />
      <Tabs.Screen name="invite" />
      <Tabs.Screen name="recommendation" />
      <Tabs.Screen name="logout" />
      <Tabs.Screen name="dday" />
    </Tabs>
  );
}