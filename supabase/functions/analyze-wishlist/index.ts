import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {

  console.log("🔥 FUNCTION HIT");

  // 🔥 CORS preflight 대응
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      console.error("🔥 OPENAI_API_KEY missing");
      return new Response(
        JSON.stringify({
          energy: '중간',
          energy_score: 3,
          energy_source: 'ai',
        }),
        { status: 200,
          headers: { 
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
         }
      );
    }

    const { text, wishlist_id, user_id } = await req.json();

    if (!text || typeof text !== 'string') {
     return new Response(
      JSON.stringify({
        energy: '중간',
        energy_score: 3,
        energy_source: 'ai',
      }),
      { status: 200 ,
        headers: { 
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
      }
);

    }

    /* =========================
     *  프롬프트
     * ========================= */
   const prompt = `
너는 커플 데이트 앱의 "활동 에너지 분석 전문가"다.
판단 기준은 감정이 아니라 "신체 활동량"이다.

아래 텍스트는 데이트 활동이다.

판단 규칙:

[1점 - 낮음]
- 집에서 쉬기
- 잠자기
- 누워있기
- 아무것도 안 하기
- 이동 거의 없음
- 활동량 거의 없음

[3점 - 중간]
- 외식 (마라탕, 치킨, 파스타 등 식당 방문)
- 카페 가기
- 영화 보기
- 쇼핑
- 가벼운 산책
- 일반적인 외출
- 이동은 있지만 활동량이 많지 않은 경우

👉 "먹으러 가기", "식당 가기"는 기본적으로 3점이다.
👉 외출이 포함되면 대부분 3점이다.

[5점 - 높음]
- 놀이공원
- 여행
- 등산
- 스포츠 / 운동
- 장시간 걷기
- 활동량이 많은 데이트

중요:
- 판단 기준은 반드시 "신체 활동량"
- 감성적 해석 금지
- JSON 이외의 설명 절대 금지

출력 형식:
{
  "energy": "낮음" | "중간" | "높음",
  "energy_score": 1 | 3 | 5
}

텍스트:
"${text}"
`;


    /* =========================
     * OpenAI 호출
     * ========================= */
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // 모델 ( 비용 낮음 )
        temperature: 0.2,  // 너무 규칙적이지 않고 안정적 + 살짝 유연한 정도 
        messages: [
          { role: 'system', content: 'You only return strict JSON.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!openaiRes.ok) {
      console.error("🔥 OpenAI status:", openaiRes.status);
      return new Response(
        JSON.stringify({
          energy: '중간',
          energy_score: 3,
          energy_source: 'ai',
        }),
        { status: 200,
          headers: { 
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
         }
      );
    }


    const json = await openaiRes.json();
    const raw = json.choices?.[0]?.message?.content;

    if (!raw) throw new Error('Empty LLM response');

    /* =========================
     * JSON 파싱 안정화
     * ========================= */
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('No JSON found');
      parsed = JSON.parse(match[0]);
    }


    /* =========================
     * 응답
     * ========================= */
    return new Response(
      JSON.stringify({
        energy: parsed.energy,
        energy_score: parsed.energy_score,
        energy_source: 'ai',
      }),
      {status: 200,
       headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('❌ analyze-wishlist error:', err);

    return new Response(
      JSON.stringify({
        energy: '중간',
        energy_score: 3,
        energy_source: 'ai',
      }),
      { status: 200,
    headers: { 
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
   }
    );
  }
});
