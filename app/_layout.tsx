import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const router = useRouter(); 
  const segments = useSegments();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    // login이랑 signup 둘 다 인증 없이 접근 가능
    const isPublicPage = segments[0] === 'login' || segments[0] === 'signup';

    if (!session && !isPublicPage) {
      router.replace('/login');
    }

    if (session && isPublicPage) {
      router.replace('/(tabs)/calendar');
    }
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}