/*
- 선택된 날짜 표시
- 내 일정 / 상대 일정 / 커플 일정 표시
- “일정 없음” 처리
*/
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import type { Schedule } from '@/src/types/schedule';
import { useEffect, useRef } from 'react';


type Props = {
  date: string;
  mySchedules: Schedule[];
  partnerSchedules: Schedule[];
  coupleSchedules: Schedule[];
};
const SCREEN_HEIGHT = Dimensions.get('window').height;

export function DaySchedulePanel({
  date,
  mySchedules,
  partnerSchedules,
  coupleSchedules,
}: Props) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [date]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={styles.date}>{date}</Text>

      <Section title="내 일정" color="#5DA9FF" schedules={mySchedules} />
      <Section title="상대 일정" color="#7ED957" schedules={partnerSchedules} />
      <Section title="커플 일정" color="#C77DFF" schedules={coupleSchedules} />
    </Animated.View>
  );
}


function Section({
  title,
  color,
  schedules,
}: {
  title: string;
  color: string;
  schedules: Schedule[];
}) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ color, fontWeight: 'bold' }}>{title}</Text>

      {schedules.length === 0 && (
        <Text style={{ color: '#777', marginTop: 4 }}>일정 없음</Text>
      )}

      {schedules.map((s) => (
        <Text key={s.id} style={{ color: '#fff', marginTop: 4 }}>
          • {s.title}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#111',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  date: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
