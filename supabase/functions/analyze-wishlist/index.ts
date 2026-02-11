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
너는 커플 데이트 앱의 "에너지 판단 전문가"야.
수천 개의 데이트 데이터를 보고 판단해.

아래 텍스트는 "데이트 활동"이야.

⚠️ 절대 "중간"을 기본값으로 쓰지 마.
⚠️ 애매하면 반드시 더 가까운 쪽으로 강하게 치우쳐.

기준:
- 누워있기 / 잠 / 휴식 / 아무것도 안 하기 / 조용히 있기 → 낮음 (1)
- 앉아만 있어도 외출 + 대화 + 카페 → 낮음 (1)
- 많이 걷기 / 놀이공원 / 여행 / 스포츠 → 높음 (5)

중간(3)은:
- 가벼운 외출 + 간단한 밥 먹기 +이동이 조금 있는 경우만 허용

출력은 반드시 JSON 하나만:
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
        model: 'gpt-4o-mini',
        temperature: 0,
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
     * 🧩 분석 로그 저장
     * ========================= */
    if (wishlist_id && user_id) {
      await fetch(`${SUPABASE_URL}/rest/v1/wishlist_analysis_logs`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wishlist_id,
          user_id,
          input_text: text,
          energy_score: parsed.energy_score,
          energy_label: parsed.energy,
          energy_source: 'ai',
        }),
      });
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
