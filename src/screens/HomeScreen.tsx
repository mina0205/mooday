import { View, Text, Button } from 'react-native';
import { supabase } from '../lib/supabase';

export default function HomeScreen() {
  return (
    <View style={{ padding: 40 }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>
        로그인 성공 🎉
      </Text>

      <Text style={{ marginBottom: 20 }}>
        여기가 나중에 공유 캘린더 메인 화면이 될 거야
      </Text>

      <Button
        title="로그아웃"
        onPress={() => supabase.auth.signOut()}
      />
    </View>
  );
}
