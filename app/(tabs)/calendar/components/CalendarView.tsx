import { View } from 'react-native';
import { Calendar } from 'react-native-calendars';

type Props = {
  markedDates: Record<string, any>;
  startDate: string | null;
  endDate: string | null;
  onSelectDate: (date: string) => void;
};

export function CalendarView({
  markedDates,
  startDate,
  endDate,
  onSelectDate,
}: Props) {
  return (
    <View>
      <Calendar
        markingType="multi-period"
        markedDates={markedDates}
        onDayPress={(day) => {
          // 판단은 부모에서!
          onSelectDate(day.dateString);
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
