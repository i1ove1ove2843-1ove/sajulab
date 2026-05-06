import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('confirming'); // confirming, analyzing, completed, error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setErrorMsg('결제 정보가 부족합니다.');
      setStatus('error');
      return;
    }

    const processPayment = async () => {
      try {
        // 1. 결제 승인 요청 (Ticket 2)
        const confirmRes = await fetch('/api/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        });
        const confirmData = await confirmRes.json();
        if (!confirmRes.ok) throw new Error(confirmData.message || '결제 승인 실패');

        // 2. 승인 성공 시 분석 요청 (Ticket 4)
        setStatus('analyzing');
        
        // 분석에 필요한 로컬 스토리지 데이터 (이름, 생년월일 등) 가져오기
        const savedForm = JSON.parse(localStorage.getItem('daon_form') || '{}');
        const savedCat = JSON.parse(localStorage.getItem('daon_category') || '{}');

        // 가이드 기반 몰입+전환 하이브리드 프롬프트 (sa9k2x + 결제유도형)
        const modelContext = `너는 50년 경력의 명리학자이자 심층 심리 상담가 '다온'이다. 
          사주는 반드시 일간(본인)을 중심으로 주변 기운의 흐름과 균형을 읽는다. 
          
          [핵심 원칙]
          1. 이미지나 데이터를 확인하면 설명이나 서두 없이 '바로 본론'으로 들어간다. "분석해보면", "설명하자면" 같은 말은 절대 하지 않는다.
          2. 말투는 부드럽지만 단정적으로 말한다. 애매한 표현, 흐릿한 말은 피하고 확신 있게 풀어낸다.
          3. 해석은 반드시 '현실 중심'으로 한다. 좋은 점만 말하지 말고, 불편하지만 맞는 부분도 분명하게 짚는다.
          4. 특히 성격, 인간관계, 돈 흐름, 연애 방식에서 사용자가 실제 겪었을 법한 구체적인 상황을 묘사한다. "이건 진짜 내 얘기다"라고 느끼게 만드는 것이 목표다.
          5. 마지막에는 반드시 '주의해야 할 점'을 현실적으로 짚어준다.`;

        const baseInfo = `이름: ${savedForm.name}, 성별: ${savedForm.gender}, 생년월일: ${savedForm.year}-${savedForm.month}-${savedForm.day} (${savedForm.birthType}), 태어난 시간: ${savedForm.hour}`;
        
        let categoryPrompt = '';
        if (savedCat.id === 'love') {
          categoryPrompt = `[연애운 특화] 상대방(${savedForm.partnerName || '모름'}, ${savedForm.partnerBirth || '모름'})과의 끌리는 이유, 반복되는 연애 패턴, 그리고 이별의 고비를 넘기는 법을 분석해줘.`;
        } else if (savedCat.id === 'year') {
          categoryPrompt = `[2026 신년운세] 2026년 병오(丙午)년의 기운이 본인의 명식과 부딪히는 시기, 특히 꺾이는 타이밍과 올라가는 시점을 시기성 있게 짚어줘.`;
        } else if (savedCat.id === 'premium') {
          categoryPrompt = `[10년 주기 프리미엄] 인생 대운의 흐름에서 반복되는 선택의 오류와 이를 극복할 성공 패턴, 그리고 향후 10년 내 가장 강력한 자산 형성 시기를 분석해줘.`;
        } else {
          categoryPrompt = `[원포인트 사주] 타고난 성향과 돈을 다루는 습관, 그리고 지금 시기에 가장 적합한 직업적 방향성을 현실적으로 짚어줘.`;
        }

        const prompt = `${modelContext}
          고객 정보: ${baseInfo}
          요청 사항: ${categoryPrompt}
          
          반드시 아래의 JSON 형식으로만 응답해.
          {
            "title": "가슴을 찌르는 강렬한 한 줄 타이틀",
            "sections": [
              { "badge": "분석 영역", "content": "300자 내외의 구체적이고 단정적인 분석 (불필요한 설명 생략)", "highlight": "사용자의 무릎을 치게 만들 핵심 디테일" }
            ],
            "upsellHook": "아직 드러나지 않은 더 중요한 운의 흐름에 대한 궁금증 유발 문구 (예: 이 부분보다 더 깊게 봐야 할 변곡점이 뒤에 숨어 있습니다)"
          }`;

        // 로컬 환경용 자동 우회 로직 (Ticket 8)
        const isLocal = window.location.hostname === 'localhost';
        let analyzeRes;
        
        try {
          analyzeRes = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, category: savedCat.id }),
          });
          
          if (!analyzeRes.ok && isLocal) throw new Error('API_NOT_FOUND');
        } catch (e) {
          if (isLocal) {
            // 로컬에서는 직접 Gemini 호출 (VITE_GEMINI_API_KEY 사용)
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            analyzeRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp:generateContent?key=${apiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
              }
            );
          } else {
            throw e;
          }
        }
        
        const rawResponse = await analyzeRes.text();
        let analyzeData;
        try {
          analyzeData = JSON.parse(rawResponse);
        } catch (e) {
          throw new Error('서버 응답 형식이 올바르지 않습니다. Vercel 배포 상태를 확인해주세요.');
        }

        if (!analyzeRes.ok) throw new Error(analyzeData.message || '분석 실패');

        const content = isLocal && !analyzeData.content ? analyzeData.candidates?.[0]?.content?.parts?.[0]?.text : analyzeData.content;
        const cleanJson = (content || "").replace(/```json|```/g, "").trim();
        setResult(JSON.parse(cleanJson));
        setStatus('completed');
      } catch (e) {
        console.error(e);
        setErrorMsg(e.message);
        setStatus('error');
      }
    };

    processPayment();
  }, [paymentKey, orderId, amount]);

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center p-6 text-[#2d2822]">
      {status === 'confirming' && (
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8b7355] mx-auto"></div>
          <p className="font-bold text-lg">결제를 확인하고 있습니다...</p>
        </div>
      )}

      {status === 'analyzing' && (
        <div className="text-center space-y-4">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-5xl">✨</motion.div>
          <p className="font-bold text-lg">다온 원장님이 명식을 짚어보고 있습니다...</p>
          <p className="text-sm text-[#8a8175]">잠시만 기다려주세요 (약 10~20초)</p>
        </div>
      )}

      {status === 'completed' && result && (
        <div className="max-w-md w-full space-y-6 py-8">
           <div className="text-center mb-10">
             <div className="inline-block px-4 py-1 bg-[#8b7355]/10 text-[#8b7355] text-[10px] font-bold rounded-full mb-3 tracking-widest border border-[#8b7355]/20 uppercase">Daon Special Report</div>
             <h2 className="text-2xl font-black text-[#2d2822] leading-tight">{result.title}</h2>
           </div>
           <div className="space-y-5">
             {result.sections?.map((sec, idx) => (
               <div key={idx} className="bg-white p-6 rounded-2xl shadow-xl border border-[#f0eae1] relative overflow-hidden">
                 <div className="inline-flex px-3 py-1 bg-[#f4f1ee] text-[#8b7355] text-[10px] font-bold rounded-md mb-4">{sec.badge}</div>
                 <div className="text-[15px] leading-[1.85] text-[#4a4238] break-keep">
                   {sec.content.split('\n').map((line, i) => (<p key={i} className="mb-3 last:mb-0">{line}</p>))}
                 </div>
                 {sec.highlight && (
                   <div className="mt-4 p-3 bg-[#fdfcfb] border-l-4 border-[#8b7355]">
                     <p className="text-[#8b7355] text-xs font-bold">💡 핵심: {sec.highlight}</p>
                   </div>
                 )}
               </div>
             ))}

             {/* AI Upsell Hook 카드 추가 (Ticket 9) */}
             {result.upsellHook && (
               <div className="mt-8 bg-gradient-to-br from-[#2d2822] to-[#4a4238] rounded-2xl p-7 text-white shadow-2xl relative overflow-hidden border border-white/10">
                 <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-4">
                     <span className="text-yellow-400">✨</span>
                     <span className="text-[10px] font-bold tracking-widest opacity-80 uppercase">Daon Insight Deep Dive</span>
                   </div>
                   <p className="text-[16px] font-bold leading-relaxed opacity-95 italic mb-4">
                     "{result.upsellHook}"
                   </p>
                   <div className="flex justify-between items-center border-t border-white/10 pt-4">
                     <span className="text-[10px] opacity-60">상담이 필요하신가요?</span>
                     <button 
                       onClick={() => window.open('https://pf.kakao.com/_your_link', '_blank')}
                       className="text-[11px] font-bold bg-white text-[#2d2822] px-4 py-2 rounded-full shadow-lg transition-transform active:scale-95"
                     >
                       1:1 프라이빗 상담 예약 →
                     </button>
                   </div>
                 </div>
                 <div className="absolute -right-6 -bottom-6 opacity-10 scale-150 pointer-events-none transform -rotate-12">
                   🌅
                 </div>
               </div>
             )}
           </div>
           <div className="pt-6">
             <button onClick={() => navigate('/')} className="w-full py-4 bg-white border border-[#e3dcd3] text-[#2d2822] font-bold rounded-xl shadow-sm hover:bg-[#fdfcfb] transition-colors">홈으로 돌아가기</button>
           </div>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center space-y-6">
          <div className="text-5xl">⚠️</div>
          <p className="font-bold text-lg text-red-500">{errorMsg}</p>
          <button onClick={() => navigate('/')} className="px-8 py-3 bg-[#2d2822] text-white rounded-xl font-bold">다시 시도하기</button>
        </div>
      )}
    </div>
  );
}
