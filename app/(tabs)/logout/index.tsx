import { View, Text, Pressable, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '@/src/lib/supabase';

export default function SettingsPage() {
  const router = useRouter()

  // 로그아웃
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      Alert.alert('로그아웃 실패', error.message)
      return
    }

    router.replace('/login')
  }

  // 탈퇴 
  const handleWithdraw = () => {
  Alert.alert(
    '회원 탈퇴',
    '탈퇴하면 커플 관계가 해제되고\n모든 커플/개인 데이터가 삭제됩니다.\n\n이 작업은 되돌릴 수 없어요.',
    [
      { text: '취소', style: 'cancel' },
      {
        text: '탈퇴',
        style: 'destructive',
        onPress: confirmWithdraw,
      },
    ]
  )
}

const confirmWithdraw = async () => {
  try {
    // 1️⃣ 탈퇴 RPC 호출 (DB 정리)
    const { error: rpcError } = await supabase.rpc('withdraw_user')

    if (rpcError) {
      Alert.alert('탈퇴 실패', '탈퇴 처리 중 오류가 발생했어요.')
      console.error(rpcError)
      return
    }

    // 2️⃣ 인증 로그아웃
    const { error: signOutError } = await supabase.auth.signOut()

    if (signOutError) {
      Alert.alert('오류', '로그아웃 중 문제가 발생했어요.')
      return
    }

    // 3️⃣ 로그인 화면으로 이동
    Alert.alert(
      '탈퇴 완료',
      '계정이 정상적으로 탈퇴되었습니다.',
      [
        {
          text: '확인',
          onPress: () => router.replace('/login'),
        },
      ]
    )
  } catch (e) {
    console.error(e)
    Alert.alert('오류', '예기치 못한 문제가 발생했어요.')
  }
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
  );
}
