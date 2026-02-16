/*
 Auth + Couple 통합 Context 코드
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthCoupleContextType {
  session: any;
  user: any;
  myNickname: string | null;
  coupleId: string | null;
  partnerId: string | null;
  partnerNickname: string | null;
  loading: boolean;
  refreshAll: () => Promise<void>;
}

const AuthCoupleContext = createContext<AuthCoupleContextType | undefined>(
  undefined
);

export const AuthCoupleProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<any>(null);
  const [myNickname, setMyNickname] = useState<string | null>(null);
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerNickname, setPartnerNickname] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);


  /* =========================
   * 전체 데이터 로드
   * ========================= */
  const loadAll = async (userId: string) => {
    // 1️⃣ 내 닉네임
    const { data: myProfile } = await supabase
      .from('user_profiles')
      .select('nickname')
      .eq('id', userId)
      .maybeSingle();

      console.log('👤 내 프로필:', myProfile);

    setMyNickname(myProfile?.nickname ?? null);

    // 2️⃣ 커플 ID
    const { data: coupleData } = await supabase
      .from('couple_members')
      .select('couple_id')
      .eq('user_id', userId)
      .maybeSingle();

      console.log('💑 coupleData:', coupleData);

    const cid = coupleData?.couple_id ?? null;
    setCoupleId(cid);

    if (!cid) {
      setPartnerId(null);
      setPartnerNickname(null);
      return;
    }

    // 3️⃣ 파트너 ID 찾기
    const { data: members } = await supabase
      .from('couple_members')
      .select('user_id')
      .eq('couple_id', cid);

      console.log('👥 members:', members);

    const partner = members?.find( m => String(m.user_id) !== String(userId) );
    const pid = partner?.user_id ?? null;

    setPartnerId(pid);

    if (!pid) {
      setPartnerNickname(null);
      return;
    }

    // 4️⃣ 파트너 닉네임
    const { data: partnerProfile } = await supabase
      .from('user_profiles')
      .select('nickname')
      .eq('id', pid)
      .maybeSingle();

      console.log('📛 partnerProfile:', partnerProfile);
    setPartnerNickname(partnerProfile?.nickname ?? null);
  };

  const refreshAll = async () => {
    if (!user) return;
    await loadAll(user.id);
  };

  /* =========================
   * 초기 로드
   * ========================= */
  useEffect(() => {
  const init = async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    setUser(data.session?.user ?? null);

    if (data.session?.user) {
      await loadAll(data.session.user.id);
    }

    setLoading(false);
  };

  init();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (_event, session) => {
    setSession(session);
    setUser(session?.user ?? null);

    if (session?.user) {
      await loadAll(session.user.id);
    } else {
      setMyNickname(null);
      setCoupleId(null);
      setPartnerId(null);
      setPartnerNickname(null);
    }
  });
  

  return () => subscription.unsubscribe();
}, []);

  return (
    <AuthCoupleContext.Provider
      value={{
        session,
        user,
        myNickname,
        coupleId,
        partnerId,
        partnerNickname,
        loading,
        refreshAll,
      }}
    >
      {children}
    </AuthCoupleContext.Provider>
  );
};

export const useAuthCouple = () => {
  const context = useContext(AuthCoupleContext);
  if (!context) {
    throw new Error('useAuthCouple must be used inside AuthCoupleProvider');
  }
  return context;
};
