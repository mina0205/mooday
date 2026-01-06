import { View, Text, TextInput, Button } from 'react-native';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  //로그인
  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    }
  };

  //회원가입 -> 바로 홈 화면진입  
  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert('회원가입 완료!');
    }
  };

  return (
    <View style={{ padding: 40 }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>
        Mooday 로그인
      </Text>

      <TextInput
        placeholder="email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={{
          borderWidth: 1,
          marginBottom: 10,
          padding: 8,
        }}
      />

      <TextInput
        placeholder="password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          marginBottom: 20,
          padding: 8,
        }}
      />

      <Button title="로그인" onPress={signIn} />
      <View style={{ height: 10 }} />
      <Button title="회원가입" onPress={signUp} />
    </View>
  );
}
