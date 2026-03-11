/**
 * PERFECT_HEART_365
 * - 상단 굴곡 확실히 파임
 * - 총 true 개수: 정확히 365
 */

const MAX_WIDTH = 29;

// 각 행의 구성 (합계: 365)
const STRUCTURE = [
  { left: 5,  gap: 8, right: 6 },  // 행 1: (12개) - 8칸 비워서 깊게 파임 <-비대칭
  { left: 9,  gap: 5, right: 9 },  // 행 2: (18개) - 5칸 비움
  { left: 12, gap: 3, right: 12 }, // 행 3: (24개) - 3칸 비움
  { total: 29 },                   // 행 4: (29개) - 합쳐짐
  { total: 29 },                   // 행 5: (29개)
  { total: 29 },                   // 행 6: (29개)
  { total: 29 },                   // 행 7: (29개)
  { total: 27 },                   // 행 8: (27개)
  { total: 25 },                   // 행 9: (25개)
  { total: 23 },                   // 행 10: (23개)
  { total: 21 },                   // 행 11: (21개)
  { total: 19 },                   // 행 12: (19개)
  { total: 17 },                   // 행 13: (17개)
  { total: 15 },                   // 행 14: (15개)
  { total: 13 },                   // 행 15: (13개)
  { total: 11 },                   // 행 16: (11개)
  { total: 9 },                    // 행 17: (9개)
  { total: 7 },                    // 행 18: (7개)
  { total: 5 },                    // 행 19: (5개)
  { total: 3 },                    // 행 20: (3개)
  { total: 1 },                    // 행 21: (1개)
];

/* [검산] 
  상단: 12 + 18 + 24 = 54
  중단: 29 * 4 = 116
  하단: 27+25+23+21+19+17+15+13+11+9+7+5+3+1 = 195
  총합: 54 + 116 + 195 = 365
*/

export const HEART_ROWS: boolean[][] = STRUCTURE.map(rowConfig => {
  const row = new Array(MAX_WIDTH).fill(false);
  
  if ('total' in rowConfig) {
    const start = Math.floor((MAX_WIDTH - rowConfig.total) / 2);
    for (let i = 0; i < rowConfig.total; i++) {
      row[start + i] = true;
    }
  } else {
    const { left, gap, right } = rowConfig;
    const start = Math.floor((MAX_WIDTH - (left + gap + right)) / 2);
    // 왼쪽 봉우리
    for (let i = 0; i < left; i++) row[start + i] = true;
    // 오른쪽 봉우리
    for (let i = 0; i < right; i++) row[start + left + gap + i] = true;
  }
  
  return row;
});

const TOTAL_COUNT = HEART_ROWS.flat().filter(Boolean).length;
console.log(`Total Count: ${TOTAL_COUNT}`); // 총 365 칸 확인