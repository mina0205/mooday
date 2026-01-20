import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import type { Schedule } from '@/src/types/schedule';

const COLORS = {
  MY: '#5DA9FF',
  PARTNER: '#7ED957',
  COUPLE: '#C77DFF',
};

type Props = {
  schedules: Schedule[];
  myUserId: string;
  onSelectDate: (date: string) => void;
};

/* 날짜 포함 여부 체크 */
function hasScheduleOnDate(schedule: Schedule, date: string) {
  return (
    schedule.start_date <= date &&
    (schedule.end_date ?? schedule.start_date) >= date
  );
}

function isMultiDay(schedule: Schedule) {
  return (
    schedule.end_date &&
    schedule.end_date !== schedule.start_date
  );
}

/* 바 색상 */
function getColor(s: Schedule, myUserId: string) {
  if (s.owner_type === 'COUPLE') return COLORS.COUPLE;
  if (s.owner_user_id === myUserId) return COLORS.MY;
  return COLORS.PARTNER;
}

export function CalendarView({
  schedules,
  myUserId,
  onSelectDate,
}: Props) {
  return (
    <Calendar
      theme={{
        calendarBackground: '#000',
        dayTextColor: '#fff',
        monthTextColor: '#fff',
        arrowColor: '#fff',
      }}
      dayComponent={({ date, state }) => {
        if (!date) return null;

        const daySchedules = schedules.filter((s) =>{
          // 단일 일정 → 그대로 표시
          if (!isMultiDay(s)) {
            return s.start_date === date.dateString;
          }

          // 멀티데이 일정 → 시작 날짜에만 표시
          return s.start_date === date.dateString;
      });

        return (
          <TouchableOpacity
            style={[
              styles.dayCell,
              state === 'disabled' && { opacity: 0.3 },
            ]}
            onPress={() => onSelectDate(date.dateString)}
          >
            {/* 날짜 */}
            <Text style={styles.dayNumber}>{date.day}</Text>

            {/* 바 + 텍스트 묶음( bar + title을 하나의 pill로 ) */}
            {daySchedules.slice(0, 3).map((s) => (
             <View
              style={[
                styles.barPill,
                { backgroundColor: getColor(s, myUserId) },
              ]}
            >
              <Text style={styles.pillText} numberOfLines={1}>
                {s.title}
              </Text>
            </View> 
            ))}

            {daySchedules.length > 3 && (
              <Text style={styles.more}>
                +{daySchedules.length - 3}
              </Text>
            )}
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  barPill: {
  width: '100%',
  height: 14,
  borderRadius: 7,
  justifyContent: 'center',
  paddingHorizontal: 4,
},
pillText: {
  fontSize: 9,
  color: '#000',
  fontWeight: '600',
},
  dayCell: {
    minHeight: 80,
    paddingTop: 4,
    alignItems: 'center',
  },
  dayNumber: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 2,
  },
  more: {
    fontSize: 9,
    color: '#aaa',
    marginTop: 2,
  },
});
