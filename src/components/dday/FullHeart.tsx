import { View, StyleSheet } from 'react-native';
import { HEART_ROWS } from './heartMap';

type Props = {
  filledCount?: number; // 채워진 칸 수 (없으면 전체 채움)
};

export default function FullHeart({ filledCount = 365 }: Props) {
  let filledSoFar = 0;

  return (
    <View style={styles.container}>
      {HEART_ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((isHeart, colIndex) => {
            if (!isHeart) {
              // 하트가 아닌 자리 → 투명
              return <View key={colIndex} style={styles.empty} />;
            }

            filledSoFar += 1;
            const isFilled = filledSoFar <= filledCount;

            return (
              <View
                key={colIndex}
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
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 8,
    height: 8,
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
