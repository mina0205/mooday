
/*
Root Layout은 라우팅만 책임진다 
*/
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthCoupleProvider, useAuthCouple } from '@/src/context/AuthCoupleContext';

function AppNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const { session, loading } = useAuthCouple();

  useEffect(() => {
    if (loading) return;

    const isPublicPage =
      segments[0] === 'login' || segments[0] === 'signup';

    if (!session) {
      if (!isPublicPage) {
        router.replace('/login');
      }
      return;
    }

    if (session && isPublicPage) {
      router.replace('/(tabs)/calendar');
    }
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthCoupleProvider>
      <AppNavigator />
    </AuthCoupleProvider>
  );
}
