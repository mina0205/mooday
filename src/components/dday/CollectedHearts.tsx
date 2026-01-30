import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { getDaysTogether } from './getDaysTogether';
import { FullHeart } from './FullHeart';

type Props = {
  startDate: string;
};

export default function CollectedHeartsPage({ startDate }: Props) {
  const daysTogether = getDaysTogether(startDate);
  const fullHearts = Math.floor(daysTogether / 365);

  if (fullHearts === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>
          아직 모은 하트가 없어요 💭
        </Text>
        <Text style={styles.subText}>
          1년이 되면 하트가 생겨요
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {Array.from({ length: fullHearts }).map((_, i) => (
        <View key={i} style={styles.heartBlock}>
          <Text style={styles.title}>
            {i + 1}번째 하트 💗
          </Text>
          <Text style={styles.yearText}>
            {i + 1}주년
          </Text>

          <FullHeart />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingBottom: 80,
  },
  heartBlock: {
    marginBottom: 32,
  },
  title: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  yearText: {
    textAlign: 'center',
    color: '#aaa',
    marginBottom: 12,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  subText: {
    color: '#777',
  },
});
