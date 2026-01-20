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

        const daySchedules = schedules.filter((s) =>
          hasScheduleOnDate(s, date.dateString)
        );

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

            {/* 바 + 텍스트 묶음 */}
            {daySchedules.slice(0, 2).map((s) => (
              <View key={s.id} style={styles.item}>
                <View
                  style={[
                    styles.bar,
                    { backgroundColor: getColor(s, myUserId) },
                  ]}
                />
                <Text style={styles.title} numberOfLines={1}>
                  {s.title}
                </Text>
              </View>
            ))}

            {daySchedules.length > 2 && (
              <Text style={styles.more}>
                +{daySchedules.length - 2}
              </Text>
            )}
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
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
  item: {
    width: '90%',
    alignItems: 'center',
    marginTop: 2,
  },
  bar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
  },
  title: {
    fontSize: 10,
    color: '#ddd',
    marginTop: 2,
  },
  more: {
    fontSize: 9,
    color: '#aaa',
    marginTop: 2,
  },
});
