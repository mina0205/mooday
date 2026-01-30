import { View, StyleSheet } from 'react-native';
import { HEART_ROWS } from './heartMap';

export function FullHeart() {
  return (
    <View style={styles.grid}>
      {HEART_ROWS.flat().map((cell, index) =>
        cell ? (
          <View key={index} style={styles.cell} />
        ) : (
          <View key={index} style={styles.empty} />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: 180,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'center',
    marginVertical: 16,
  },
  cell: {
    width: 8,
    height: 8,
    margin: 0.5,
    borderRadius: 2,
    backgroundColor: '#FF5D8F',
  },
  empty: {
    width: 8,
    height: 8,
    margin: 0.5,
    backgroundColor: 'transparent',
  },
});
