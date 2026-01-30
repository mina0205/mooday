//CollectedHearts.tsx → 화면 UI로 가는 라우트 

import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import CollectedHearts from '@/src/components/dday/CollectedHearts';

export default function HeartsPage() {
  const { startDate } = useLocalSearchParams<{ startDate: string }>();

  if (!startDate) return null;

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CollectedHearts startDate={startDate} />
    </View>
  );
}
