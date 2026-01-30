import { View, StyleSheet } from 'react-native';
import { HEART_ROWS } from './heartMap';

type Props = {
  filledCount: number;
};

export function HeartProgress({ filledCount }: Props) {
  let filled = 0;

  return (
    <View style={styles.wrapper}>
      {HEART_ROWS.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {row.map((isHeart, colIdx) => {
            if (!isHeart) {
              return <View key={colIdx} style={styles.empty} />;
            }

            filled += 1;
            const isFilled = filled <= filledCount;

            return (
              <View
                key={colIdx}
                style={[
                  styles.cell,
                  isFilled ? styles.filled : styles.unfilled,
                ]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 11,
    height: 11,
    margin: 0.5,
    borderRadius: 2,
  },
  filled: {
    backgroundColor: '#FF5D8F',
  },
  unfilled: {
    backgroundColor: 'rgba(255,93,143,0.25)',
  },
  empty: {
    width: 8,
    height: 8,
    margin: 0.5,
    backgroundColor: 'transparent',
  },
});
