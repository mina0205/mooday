import { View, Text, Pressable, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '@/src/lib/supabase';

export default function SettingsPage() {
  const router = useRouter()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      Alert.alert('로그아웃 실패', error.message)
      return
    }

    router.replace('/login')
  }

  const handleWithdraw = () => {
    Alert.alert(
      '회원 탈퇴',
      '정말 탈퇴하시겠어요?\n모든 데이터가 삭제됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '아직 준비 중이에요',
              '회원 탈퇴 기능은 곧 추가될 예정이에요!'
            )
          },
        },
      ]
    )
  }

  return (
    <View style={{ flex: 1, padding: 40 }}>
      

      {/* 로그아웃 */}
      <Pressable
        onPress={handleLogout}
        style={{
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderColor: '#eee',
        }}
      >
        <Text style={{ fontSize: 16 }}>로그아웃</Text>
      </Pressable>

      {/* 회원 탈퇴 */}
      <Pressable
        onPress={handleWithdraw}
        style={{
          paddingVertical: 16,
        }}
      >
        <Text style={{ fontSize: 16, color: '#ff4d4f' }}>
          회원 탈퇴
        </Text>
      </Pressable>
    </View>
  )
}
