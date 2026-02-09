import { View, Text, StyleSheet, ScrollView } from 'react-native';

type Props = {
  startDate: string;
};

export function AnniversaryList({ startDate }: Props) {
  const anniversaries = generateAnniversaries(startDate);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>기념일</Text>

      <ScrollView>
        {anniversaries.map((a) => (
          <View key={a.label} style={styles.item}>  
            <Text
            style={[
                styles.label,
                a.label.includes('주년') && { color: '#d268e2ff' },
            ]}
            >
            {a.label}
            </Text>
            <Text style={styles.date}>{a.date}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/* ---------- utils ---------- */
function generateAnniversaries(
  startDate: string,
  maxYears = 10,
  maxDays = 3000
) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const list: {
    label: string;
    date: string;
    day: number;
  }[] = [];

  /* ------------------------------
   * 100일 단위
   * ------------------------------ */
  for (let day = 100; day <= maxDays; day += 100) {
    const date = new Date(start);
    date.setDate(start.getDate() + day - 1);

    list.push({
      label: `${day}일`,
      date: date.toISOString().slice(0, 10),
      day,
    });
  }

  /* ------------------------------
   * n주년 단위
   * ------------------------------ */
  for (let year = 1; year <= maxYears; year++) {
    const date = new Date(start);
    date.setFullYear(start.getFullYear() + year);

    list.push({
      label: `${year}주년`,
      date: date.toISOString().slice(0, 10),
      day: year * 365, // 정렬용
    });
  }

  /* ------------------------------
   * 날짜 기준 정렬
   * ------------------------------ */
  return list.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
}


/* ---------- styles ---------- */
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#222',
    maxHeight: 300,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#222',
  },
  label: {
    color: '#5DA9FF',
    fontWeight: 'bold',
  },
  date: {
    color: '#aaa',
  },
});
