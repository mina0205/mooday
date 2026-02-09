import { View, Text, TextInput, StyleSheet, TouchableOpacity,Alert, } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { User } from '@supabase/supabase-js';

type Notice = {
  id: string;
  content: string;
};

type Props = {
  coupleId: string;
};

export function CoupleNotice({ coupleId }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ------------------------------
   * 공지 조회 <- 커플 아이디가 있어야 가능 
  * ------------------------------ */
  useEffect(() => {
  if (!coupleId) {
    setLoading(false);
    return;
  }
  fetchNotices();
}, [coupleId]);

useEffect(() => {
  const loadUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  };
  loadUser();
}, []);

  const fetchNotices = async () => {
    const { data, error } = await supabase
      .from('couple_notices')
      .select('id, content')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('공지 조회 에러:', error);
      return;
    }

    setNotices(data ?? []);
    setLoading(false);
  };

  /* ------------------------------
   * 공지 추가 / 수정 (커플이면 가능)
   * ------------------------------ */
  const saveNotice = async () => {
  if (!user) return;
  if (!input.trim()) return;

  if (editingId) {
    const { data, error } = await supabase
      .from('couple_notices')
      .update({ content: input })
      .eq('id', editingId)
      .select();

    if (error || !data || data.length === 0) {
      Alert.alert('수정 실패', '공지 수정에 실패했어요');
      return;
    }

    // 즉시 UI 반영
    setNotices((prev) =>
      prev.map((n) =>
        n.id === editingId
          ? { ...n, content: data[0].content }
          : n
      )
    );
  }
  else {
    const { data, error } = await supabase
      .from('couple_notices')
      .insert({
        couple_id: coupleId,
        content: input,
        owner_user_id: user.id,
      })
      .select();

    if (error || !data || data.length === 0) {
      Alert.alert('저장 실패', error?.message ?? '공지 저장 실패');
      return;
    }

    setNotices((prev) => [...prev, data[0]]);
  }

  setInput('');
  setEditingId(null);
};


  /* ------------------------------
   * 공지 삭제 (커플이면 가능)
   * ------------------------------ */
  const deleteNotice = async (id: string) => {
    await supabase
      .from('couple_notices')
      .delete()
      .eq('id', id);

    fetchNotices();
  };

  if (loading) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📌 공지사항</Text>

      {/* 공지 리스트 */}
      {notices.length === 0 && (
        <Text style={styles.empty}>* 공지사항이 없어요</Text>
      )}

      {notices.map((n) => (
        <View key={n.id} style={styles.noticeRow}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => {
              setEditingId(n.id);
              setInput(n.content);
            }}
          >
            <Text style={styles.noticeText}>• {n.content}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => deleteNotice(n.id)}>
            <Text style={styles.delete}>삭제</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* 입력 영역 */}
      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="공지사항을 입력하세요"
        placeholderTextColor="#666"
        style={styles.input}
      />

      <TouchableOpacity onPress={saveNotice}>
        <Text style={styles.save}>
          {editingId ? '수정' : '추가'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/* ------------------------------
 * 스타일
 * ------------------------------ */
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#222',
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  empty: {
    color: '#777',
    marginBottom: 8,
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  noticeText: {
    color: '#fff',
  },
  delete: {
    color: '#ff6b6b',
    marginLeft: 12,
    fontSize: 12,
  },
  input: {
    color: '#fff',
    borderBottomWidth: 1,
    borderColor: '#333',
    paddingVertical: 6,
    marginTop: 8,
  },
  save: {
    color: '#5DA9FF',
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'right',
  },
});
