import { View, Text, TextInput, Pressable, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { supabase } from '@/src/lib/supabase'

export default function NicknameOnboarding() {
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
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
      Alert.alert('오류', '저장 실패')
      return
    }

    // 🔥 메인으로 이동
    router.replace('/(tabs)/calendar')
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 30 }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>
        닉네임을 설정해주세요 💛
      </Text>

      <TextInput
        value={nickname}
        onChangeText={setNickname}
        placeholder="닉네임 입력"
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
          padding: 14,
          marginBottom: 20,
        }}
      />

      <Pressable
        onPress={handleSave}
        style={{
          backgroundColor: '#111',
          padding: 16,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          {loading ? '저장 중...' : '시작하기'}
        </Text>
      </Pressable>
    </View>
  )
}
