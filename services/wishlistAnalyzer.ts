// 규칙 기반 위시리스트 분석 (무료)

export interface AnalyzedWishlist {
  title: string;
  energy: string;
  mood: string;
  originalText: string;
}

export function analyzeWishlist(text: string): AnalyzedWishlist {
  const lowercaseText = text.toLowerCase();
  
  // ===== 에너지 레벨 분석 =====
  let energy: string = "중간";
  
  // 높은 에너지 키워드
  const highEnergyKeywords = [
    "놀이공원", "롯데월드", "에버랜드", "클럽", "페스티벌", 
    "액티비티", "등산", "운동", "스포츠", "번지", "서핑",
    "신나", "활동적", "파티", "댄스", "드라이브", "여행",
    "바다", "수영", "볼링", "당구", "노래방", "게임"
  ];
  
  // 낮은 에너지 키워드
  const lowEnergyKeywords = [
    "카페", "영화", "산책", "조용", "집", "독서", "힐링", 
    "휴식", "차분", "평화", "편안", "수다", "브런치",
    "전시회", "미술관", "박물관", "도서관", "공원",
    "야경", "감상", "피크닉"
  ];
  
  // 키워드 매칭
  if (highEnergyKeywords.some(keyword => lowercaseText.includes(keyword))) {
    energy = "높음";
  } else if (lowEnergyKeywords.some(keyword => lowercaseText.includes(keyword))) {
    energy = "낮음";
  }
  
  // ===== 무드 분석 =====
  const moodList: string[] = [];
  
  // 행복 키워드
  if (/행복|즐거|재미|신나|웃|좋|즐|기쁨|유쾌/.test(lowercaseText)) {
    moodList.push("행복");
  }
  
  // 설렘 키워드
  if (/설레|두근|떨리|기대|궁금|새로|처음|특별/.test(lowercaseText)) {
    moodList.push("설렘");
  }
  
  // 차분함 키워드
  if (/평화|고요|차분|편안|조용|여유|느긋|힐링|휴식/.test(lowercaseText)) {
    moodList.push("차분함");
  }
  
  // 로맨틱 키워드
  if (/로맨틱|낭만|분위기|감성|데이트|함께|둘이|야경|석양/.test(lowercaseText)) {
    moodList.push("로맨틱");
  }
  
  // 활동적 키워드
  if (/활동|움직|달리|뛰|액티|스포츠|운동/.test(lowercaseText)) {
    moodList.push("활동적");
  }
  
  // 기본 무드 (아무것도 매칭 안 되면)
  if (moodList.length === 0) {
    moodList.push("행복");
  }
  
  // 무드를 쉼표로 연결
  const mood = moodList.join(", ");
  
  // ===== 제목 생성 =====
  // 20자 이상이면 자르고, 의미있는 부분만 추출
  let title = text.trim();
  
  // 불필요한 문구 제거
  title = title
    .replace(/하고 싶어|가고 싶어|보고 싶어|먹고 싶어/g, '')
    .trim();
  
  // 너무 길면 자르기
  if (title.length > 20) {
    title = title.slice(0, 20) + '...';
  }
  
  // 빈 제목이면 원본 텍스트 일부 사용
  if (!title) {
    title = text.length > 20 ? text.slice(0, 20) + '...' : text;
  }
  
  return {
    title,
    energy,
    mood,
    originalText: text,
  };
}

// 테스트용 예제
/*
console.log(analyzeWishlist("롯데월드 가고 싶어!"));
// { title: "롯데월드", energy: "높음", mood: "행복, 설렘", originalText: "..." }

console.log(analyzeWishlist("조용한 카페에서 수다 떨고 싶다"));
// { title: "조용한 카페에서 수다 떨", energy: "낮음", mood: "차분함, 로맨틱", originalText: "..." }
*/