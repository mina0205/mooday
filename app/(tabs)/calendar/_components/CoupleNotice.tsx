import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';

type Notice = {
  id: string;
  content: string;
};

type Props = {
  coupleId: string;
};

export function CoupleNotice({ coupleId }: Props) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ------------------------------
   * 공지 조회
   * ------------------------------ */
  useEffect(() => {
    if (!coupleId) return;
    fetchNotices();
  }, [coupleId]);

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
   * 추가 / 수정
   * ------------------------------ */
  const saveNotice = async () => {
    if (!input.trim()) return;

    if (editingId) {
      // 수정
      await supabase
        .from('couple_notices')
        .update({ content: input })
        .eq('id', editingId);
    } else {
      // 추가
      await supabase
        .from('couple_notices')
        .insert({
          couple_id: coupleId,
          content: input,
        });
    }

    setInput('');
    setEditingId(null);
    fetchNotices();
  };

  /* ------------------------------
   * 삭제
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
