/*
- 선택된 날짜 표시
- 내 일정 / 상대 일정 / 커플 일정 표시
- “일정 없음” 처리
*/
import { View, Text, StyleSheet, Animated, Dimensions,TouchableOpacity } from 'react-native';
import type { Schedule } from '@/src/types/schedule';
import { useEffect, useRef } from 'react';

type Props = {
  date: string;
  mySchedules: Schedule[];
  partnerSchedules: Schedule[];
  coupleSchedules: Schedule[];
  onPressSchedule: (schedule: Schedule) => void;
  onClose: () => void; 
};

export function DaySchedulePanel({
  date,
  mySchedules,
  partnerSchedules,
  coupleSchedules,
  onPressSchedule,
  onClose,
}: Props) {
  const { height: SCREEN_HEIGHT } = Dimensions.get('window');
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [date]);

  // 패널 닫기 버튼 
  const closePanel = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }] },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.date}>{date}</Text>
        <TouchableOpacity onPress={closePanel} hitSlop={10}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
      </View>

      <Section title="내 일정" color="#5DA9FF" schedules={mySchedules} onPressSchedule={onPressSchedule} />
      <Section title="상대 일정" color="#7ED957" schedules={partnerSchedules} onPressSchedule={onPressSchedule} />
      <Section title="커플 일정" color="#C77DFF" schedules={coupleSchedules} onPressSchedule={onPressSchedule} />
    </Animated.View>
  );
}


function Section({
  title,
  color,
  schedules,
  onPressSchedule,
}: {
  title: string;
  color: string;
  schedules: Schedule[];
  onPressSchedule: (schedule: Schedule) => void;

}) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ color, fontWeight: 'bold' }}>{title}</Text>

      {schedules.length === 0 && (
        <Text style={{ color: '#777', marginTop: 4 }}>일정 없음</Text>
      )}

      {schedules.map((s) => (
      <TouchableOpacity
        key={s.id}
        onPress={() => onPressSchedule(s)}
        activeOpacity={0.7}
      >
        <Text style={{ color: '#fff', marginTop: 4 }}>
          • {s.title}
        </Text>
      </TouchableOpacity>
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
  header: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
},

close: {
  color: '#aaa',
  fontSize: 20,
  fontWeight: 'bold',
},
});
