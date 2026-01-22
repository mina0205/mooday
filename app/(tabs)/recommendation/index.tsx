import { View, Text, StyleSheet } from 'react-native';

export default function RecommendationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🚧 준비 중</Text>
      <Text style={styles.subtext}>AI 기반 데이트 추천 기능은 곧 추가될 예정이에요!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  text: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: '#666',
  },
});