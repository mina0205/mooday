import { View, Text, ScrollView } from 'react-native';

export default function CollectedHeartsPage({ startDate }) {
  const daysTogether = getDaysTogether(startDate);
  const fullHearts = Math.floor(daysTogether / 365);

  if (fullHearts === 0) {
    return <Text>아직 모은 하트가 없어요 💭</Text>;
  }

  return (
    <ScrollView>
      {Array.from({ length: fullHearts }).map((_, i) => (
        <View key={i}>
          <Text>{i + 1}번째 하트</Text>
          <FullHeart />
        </View>
      ))}
    </ScrollView>
  );
}
