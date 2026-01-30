import { View, StyleSheet } from 'react-native';
import { HEART_MAP } from './heartMap';

type Props = {
  filledCount: number;
};

export function HeartProgress({ filledCount }: Props) {
  let filled = 0;

  return (
    <View style={styles.grid}>
      {HEART_MAP.map((isHeart, idx) => {
        if (!isHeart) {
          return <View key={idx} style={styles.empty} />;
        }

        filled += 1;
        const isFilled = filled <= filledCount;

        return (
          <View
            key={idx}
            style={[
              styles.cell,
              isFilled ? styles.filled : styles.unfilled,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: 240,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: 12,
    height: 12,
    margin: 1,
    borderRadius: 2,
  },
  filled: {
    backgroundColor: '#FF5D8F',
  },
  unfilled: {
    backgroundColor: '#333',
  },
  empty: {
    width: 12,
    height: 12,
    margin: 1,
    backgroundColor: 'transparent',
  },
});
