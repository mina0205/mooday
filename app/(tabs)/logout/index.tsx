import { View, Text, Pressable, Alert,TextInput } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '@/src/lib/supabase';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const router = useRouter()

  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)

  // ✅ 기존 닉네임 불러오기
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const emailPrefix = user.email?.split('@')[0] || user.id

  const { data, error } = await supabase
    .from('user_profiles')
    .select('nickname')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    console.error(error)
    return
  }

  // ✅ 1️⃣ 프로필이 아예 없는 경우 → 생성
  if (!data) {
    const { error: insertError } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        nickname: emailPrefix, // 🔥 이메일 앞부분
      })

    if (insertError) {
      console.error(insertError)
      return
    }

    setNickname(emailPrefix)
    return
  }

  // ✅ 2️⃣ nickname이 null/빈값인 경우 → 기본값 세팅
  if (!data.nickname || data.nickname.trim() === '') {
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ nickname: emailPrefix })
      .eq('id', user.id)

    if (updateError) {
      console.error(updateError)
      return
    }

    setNickname(emailPrefix)
    return
  }

  // ✅ 3️⃣ 정상 닉네임 존재
  setNickname(data.nickname)
}


  // ✅ 닉네임 저장
  const handleSaveNickname = async () => {
    if (!nickname.trim()) {
      Alert.alert('알림', '닉네임을 입력해주세요.')
      return
    }

    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase
      .from('user_profiles')
      .upsert(
        {
          id: user.id,
          nickname: nickname.trim(),
        },
        { onConflict: 'id' }
      )

    setLoading(false)

    if (error) {
      Alert.alert('오류', '닉네임 저장 실패')
      console.error(error)
      return
    }

    Alert.alert('완료', '닉네임이 저장되었습니다.')
  }

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
      

      {/* 닉네임 설정 */}
      <Text style={{ fontSize: 18, marginBottom: 10 }}>닉네임 설정</Text>

      <TextInput
        value={nickname}
        onChangeText={setNickname}
        placeholder="닉네임을 입력하세요"
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
          padding: 12,
          marginBottom: 10,
        }}
      />

      <Pressable
        onPress={handleSaveNickname}
        style={{
          backgroundColor: '#111',
          padding: 14,
          borderRadius: 8,
          marginBottom: 30,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          {loading ? '저장 중...' : '닉네임 저장'}
        </Text>
      </Pressable>

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
