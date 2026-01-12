/*
- Calendar 렌더링
- markedDates 적용
- 날짜 클릭 → 선택 / 해제 토글
*/
import { View } from 'react-native';
import { Calendar } from 'react-native-calendars';

type Props = {
  markedDates: Record<string, any>;
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
};

export function CalendarView({
  markedDates,
  selectedDate,
  onSelectDate,
}: Props) {
  return (
    <View>
      <Calendar
        markingType="multi-period"
        markedDates={markedDates}
        onDayPress={(day) => {
          // 같은 날짜 누르면 해제
          if (selectedDate === day.dateString) {
            onSelectDate(null);
          } else {
            onSelectDate(day.dateString);
          }
        }}
        theme={{
          calendarBackground: '#000',
          dayTextColor: '#fff',
          monthTextColor: '#fff',
          arrowColor: '#fff',
          todayTextColor: '#5DA9FF',
          selectedDayBackgroundColor: '#333',
        }}
      />
    </View>
  );
}
