import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { getDaysTogether } from './getDaysTogether';
import FullHeart from './FullHeart';

type Props = {
  startDate: string;
};

export function CollectedHeartsPage({ startDate }: Props) {
  const daysTogether = getDaysTogether(startDate);
  const fullHearts = Math.floor(daysTogether / 365);

  if (fullHearts === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>
          아직 모은 하트가 없어요 💭
        </Text>
        <Text style={styles.subText}>
          1년이 되면 하트가 생겨요 !
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {Array.from({ length: fullHearts }).map((_, i) => (
        <View key={i} style={styles.heartBlock}>
          <Text style={styles.title}>
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
    backgroundColor: '#111',
    paddingVertical: 24,
    paddingBottom: 80,
    paddingHorizontal: 16,
  },
  heartBlock: {
    marginBottom: 32,
  },
  title: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emptyWrap: {
    backgroundColor: '#111',
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  subText: {
   color: '#FF5D8F',
  },
});
