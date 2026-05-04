import React, { useState } from 'react';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { Sparkles, ArrowRight, Heart, Star, BookOpen, Crown, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const TOSS_CLIENT_KEY = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const CATEGORIES = [
  { id: 'free', title: '오늘의 운세 (무료)', price: 0, icon: Sparkles, desc: '오늘 하루 나의 재물운과 애정운', img: '/images/hero.png' },
  { id: 'basic', title: '원포인트 사주/궁합', price: 4900, icon: Star, desc: '특정 주제 핵심 사주 풀이', img: '/images/card1.png' },
  { id: 'year', title: '2026년 대박 신년운세', price: 9900, icon: BookOpen, desc: '2026년 전체 운과 대운 분석', img: '/images/card2.png' },
  { id: 'worry', title: '1:1 맞춤 고민상담', price: 11900, icon: MessageCircle, desc: '고민에 대한 명쾌한 해답', img: '/images/card3.png' },
  { id: 'premium', title: 'VVIP 심층 분석', price: 49000, icon: Crown, desc: '명리+점성술 10년 주기 리포트', img: '/images/card4.png' },
];

export default function CustomerApp() {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState('basic');
  const [form, setForm] = useState({
    name: '', birth: '', time: '', gender: '여',
    partnerName: '', partnerBirth: '',
    worry: '', hanjaName: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const APP_URL = "https://sajulab-ten.vercel.app";

  const selectedCat = CATEGORIES.find(c => c.id === category);

  const handleCopyLink = async (platform) => {
    let copyText = `✨ 정통 다온명리원\n수십 년 경력 다온 원장님의 프리미엄 사주!\n👇 한 번 해봐\n\n🔗 ${APP_URL}`;
    try {
      await navigator.clipboard.writeText(copyText);
      alert(`${platform} 홍보 문구와 링크가 복사되었습니다!`);
    } catch (e) {
      alert("복사 실패. 다시 시도해주세요.");
    }
  };

  const fetchWithRetry = async (url, options) => {
    const response = await fetch(url, options);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${err.error?.message || response.statusText}`);
    }
    return await response.json();
  };

  const getPrompt = () => {
    const baseInfo = `이름: ${form.name}, 성별: ${form.gender}, 생년월일: ${form.birth}, 태어난 시간: ${form.time || '모름'}`;
    const jsonInstruction = `
      반드시 다음 JSON 형식으로만 응답해. 백틱이나 마크다운 없이 순수 JSON만 출력해. 그리고 내용(content) 작성 시 절대로 **나 * 같은 마크다운 기호를 쓰지 말고 오직 평문(Plain text)으로만 작성해.
      {
        "title": "결과 메인 타이틀",
        "sections": [
          { "badge": "섹션 소제목(예: 음양오행, 올해의 팁 등)", "content": "자세한 분석 내용 텍스트 (줄바꿈 가능)", "highlight": "가장 중요한 핵심 한 줄 요약 (노란색으로 표시됨, 없으면 빈 문자열)" }
        ]
      }
    `;

    if (category === 'free') {
      return `너는 수십년 경력의 명리학자 다온 원장이야. 고객의 오늘 하루 운세(재물운, 애정운, 오늘 조심할 점)를 가볍고 재미있게 분석해줘.
      고객정보: ${baseInfo}
      ${jsonInstruction}`;
    } else if (category === 'basic') {
      return `너는 수십년 경력의 명리학자 다온 원장이야. 고객의 핵심 원포인트 사주와 타고난 기질, 그리고 상대방 정보가 있다면 궁합을 분석해줘.
      본인 정보: ${baseInfo}
      상대방 정보: 이름 ${form.partnerName || '없음'}, 생년월일 ${form.partnerBirth || '없음'}
      ${jsonInstruction}`;
    } else if (category === 'year') {
      return `너는 수십년 경력의 명리학자 다온 원장이야. 고객의 2026년 대운과 신년운세를 분석해줘.
      고객정보: ${baseInfo}
      ${jsonInstruction}`;
    } else if (category === 'worry') {
      return `너는 수십년 경력의 명리학자 다온 원장이야. 고객이 고민을 털어놓았어. 사주를 바탕으로 현실적인 조언과 해결책을 제시해줘.
      고객정보: ${baseInfo}
      고민내용: ${form.worry}
      ${jsonInstruction}`;
    } else {
      return `너는 동양 명리, 서양 점성술, 수비학을 함께 해석하는 고급 운세 분석가이자 커리어 전략가 다온 원장이다. 단정적인 예언이 아니라, 경향성과 가능성, 전략적 해석 중심으로 작성하라. 실질적으로 도움이 되는 방향으로 분석하라.
      [고객정보] ${baseInfo}
      [분석 목표] 내 커리어 운, 금전 운, 인생 황금기를 사주·점성술·수비학 기준으로 통합 분석.
      1. 사주 분석 (일간 성향, 오행 강약, 용신, 강점/약점)
      2. 서양 점성술 분석 (사회적 이미지, MC, 목성, 성공 패턴)
      3. 수비학 분석 (라이프패스 넘버, 운이 열리는 시기)
      4. 인생 황금기 및 정점 TOP 5 (연도, 나이, 상승이유, 기회)
      5. 10년 단위 인생 흐름 (40대~70대 점수화)
      ${jsonInstruction}`;
    }
  };

  const handlePayment = async () => {
    if (!form.name || !form.birth) {
      alert("필수 정보를 모두 입력해주세요.");
      return;
    }
    
    try {
      if (selectedCat.price > 0) {
        const toss = await loadTossPayments(TOSS_CLIENT_KEY);
        // toss.requestPayment("카드", { ... }) (테스트 환경에서는 생략)
      }
      
      setLoading(true);
      setStep(2);
      
      const prompt = getPrompt();
      const response = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      );
      
      let rawText = response.candidates[0].content.parts[0].text;
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(rawText);
      
      setResult(data);
      setLoading(false);
      setStep(3);
      
    } catch (e) {
      console.error(e);
      alert("분석 중 오류가 발생했습니다. 다시 시도해주세요.");
      setLoading(false);
      setStep(1);
    }
  };

  return (
    <div className={`min-h-screen font-sans relative transition-colors duration-700 ${step === 3 ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2a1d45] via-[#150e1f] to-[#0a0710] text-white' : 'bg-[#faf8f5] text-neutral-900'}`}>
      
      <div className="max-w-md mx-auto w-full p-6 relative z-10 min-h-screen flex flex-col justify-center">
        
        {/* STEP 1: 입력 및 결제 (중성적 웜 베이지 톤) */}
        {/* STEP 0: 스토어프론트 (메인 홈) */}
        {step === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 py-6 pb-24">
            
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-4xl font-black tracking-tight text-[#2d2822]">
                다온명리원
              </h1>
              <p className="text-[#6b6255] font-medium text-sm leading-relaxed px-4">
                "당신의 이야기에 귀 기울이는 시간, 다온 원장이 함께합니다."<br/><br/>
                사람마다 타고난 빛깔이 있고, 흘러가는 계절이 있습니다.<br/>
                다온 원장은 수많은 분들의 사주 명식을 마주하며<br/>
                글자 너머에 담긴 당신의 삶을 읽어드립니다.
              </p>
            </div>

            {/* 히어로 배너 (무료 운세) */}
            <div 
              onClick={() => { setCategory('free'); setStep(1); }}
              className="relative w-full h-56 rounded-3xl overflow-hidden cursor-pointer shadow-lg group"
            >
              <img src={CATEGORIES[0].img} alt="오늘의 운세" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
                <div className="inline-block px-3 py-1 bg-[#8b7355] text-white text-xs font-bold rounded-full mb-2 w-max shadow-md">무료 체험</div>
                <h2 className="text-2xl font-black text-white">{CATEGORIES[0].title}</h2>
                <p className="text-white/80 text-sm mt-1">{CATEGORIES[0].desc}</p>
                <div className="mt-3 flex items-center text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                  바로 확인하기 <ArrowRight size={16} className="ml-1" />
                </div>
              </div>
            </div>

            {/* 2x2 유료 상품 그리드 */}
            <div className="grid grid-cols-2 gap-4">
              {CATEGORIES.slice(1).map(cat => (
                <div 
                  key={cat.id} 
                  onClick={() => { setCategory(cat.id); setStep(1); }}
                  className="relative h-48 rounded-2xl overflow-hidden cursor-pointer shadow-md group"
                >
                  <img src={cat.img} alt={cat.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4">
                    <div className="text-[#d4c8b8] font-bold text-xs mb-1">{cat.price.toLocaleString()}원</div>
                    <div className="text-white font-bold leading-tight mb-1 break-keep">{cat.title}</div>
                    <div className="text-white/60 text-[10px] leading-tight line-clamp-2 break-keep">{cat.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 1: 상세 페이지 및 정보 입력 */}
        {step === 1 && selectedCat && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 py-6 pb-24">
            
            {/* 뒤로가기 헤더 */}
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => setStep(0)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#2d2822] hover:bg-neutral-50 transition-colors">
                <ArrowRight size={20} className="rotate-180" />
              </button>
              <div>
                <h2 className="text-xl font-black text-[#2d2822]">{selectedCat.title}</h2>
                <p className="text-[#8b7355] text-sm font-bold">{selectedCat.price === 0 ? '무료' : `${selectedCat.price.toLocaleString()}원`}</p>
              </div>
            </div>

            {/* 미리보기 (호기심 유발) */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#ebe5de]">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-[#8b7355]" />
                <span className="font-bold text-[#4a4238] text-sm">이런 식으로 분석해 드려요!</span>
              </div>
              <div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2a1d45] via-[#150e1f] to-[#0a0710] rounded-xl p-4 text-white relative overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                  <div className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/30 text-white font-bold text-sm shadow-xl">
                    분석 완료 후 원본 확인 가능 🔒
                  </div>
                </div>
                <div className="opacity-60 space-y-3 pointer-events-none select-none filter blur-[2px]">
                  <div className="inline-block px-2 py-1 bg-purple-900/40 text-purple-200 text-[10px] font-bold rounded-full border border-purple-500/30">핵심 요약</div>
                  <div className="font-bold text-lg">타고난 기운과 올해의 흐름</div>
                  <p className="text-sm text-white/80 leading-relaxed">
                    명식 분석 결과 큰 변화를 맞이하는 시기입니다. 당신이 가진 고유한 장점이 빛을 발하며, 특히 이동수와 함께 재물운이 강하게 작용하여...
                  </p>
                  <div className="mt-2 text-yellow-300 text-sm font-bold">💡 다온 원장의 조언: 무리한 확장보다는...</div>
                </div>
              </div>
            </div>

            {/* 입력 폼 */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#ebe5de] space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#6b6255]">이름</label>
                  <input type="text" placeholder="홍길동" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-[#fdfcfb] shadow-inner border border-[#e3dcd3] rounded-xl px-4 py-3 text-[#2d2822] transition-all focus:outline-none focus:border-[#8b7355] focus:ring-2 focus:ring-[#8b7355]/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#6b6255]">성별</label>
                  <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="w-full bg-[#fdfcfb] shadow-inner border border-[#e3dcd3] rounded-xl px-4 py-3 text-[#2d2822] transition-all focus:outline-none focus:border-[#8b7355] focus:ring-2 focus:ring-[#8b7355]/20">
                    <option value="여">여성</option>
                    <option value="남">남성</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#6b6255]">생년월일 (8자리)</label>
                <input type="text" placeholder="19950505" value={form.birth} onChange={e => setForm({...form, birth: e.target.value})} className="w-full bg-[#fdfcfb] shadow-inner border border-[#e3dcd3] rounded-xl px-4 py-3 text-[#2d2822] transition-all focus:outline-none focus:border-[#8b7355] focus:ring-2 focus:ring-[#8b7355]/20" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#6b6255]">태어난 시간 (선택)</label>
                <input type="text" placeholder="오후 2시 30분" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="w-full bg-[#fdfcfb] shadow-inner border border-[#e3dcd3] rounded-xl px-4 py-3 text-[#2d2822] transition-all focus:outline-none focus:border-[#8b7355] focus:ring-2 focus:ring-[#8b7355]/20" />
              </div>

              {/* 동적 필드 */}
              {category === 'basic' && (
                <div className="space-y-4 pt-4 border-t border-[#f0eae1]">
                  <div className="text-sm font-bold text-[#8b7355]">상대방 정보 입력 (궁합 원할 시)</div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="상대방 이름" value={form.partnerName} onChange={e => setForm({...form, partnerName: e.target.value})} className="w-full bg-[#fdfcfb] shadow-inner border border-[#e3dcd3] rounded-xl px-4 py-3 text-[#2d2822] transition-all focus:outline-none focus:border-[#8b7355] focus:ring-2 focus:ring-[#8b7355]/20" />
                    <input type="text" placeholder="생년월일(8자리)" value={form.partnerBirth} onChange={e => setForm({...form, partnerBirth: e.target.value})} className="w-full bg-[#fdfcfb] shadow-inner border border-[#e3dcd3] rounded-xl px-4 py-3 text-[#2d2822] transition-all focus:outline-none focus:border-[#8b7355] focus:ring-2 focus:ring-[#8b7355]/20" />
                  </div>
                </div>
              )}
              {category === 'worry' && (
                <div className="space-y-2 pt-4 border-t border-[#f0eae1]">
                  <label className="text-xs font-bold text-[#6b6255]">현재 가장 고민되는 부분</label>
                  <textarea rows="3" placeholder="예: 이직을 해야할지 고민입니다..." value={form.worry} onChange={e => setForm({...form, worry: e.target.value})} className="w-full bg-[#fdfcfb] shadow-inner border border-[#e3dcd3] rounded-xl px-4 py-3 text-[#2d2822] transition-all focus:outline-none focus:border-[#8b7355] focus:ring-2 focus:ring-[#8b7355]/20 resize-none" />
                </div>
              )}

              <button 
                onClick={handlePayment} 
                className="w-full bg-gradient-to-r from-[#2d2822] to-[#4a4238] hover:from-[#1a1714] hover:to-[#2d2822] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-[#2d2822]/20 transition-all active:scale-95 mt-4"
              >
                {selectedCat.price === 0 ? "무료로 분석 시작하기" : `${selectedCat.price.toLocaleString()}원 결제하고 분석 시작`} <ArrowRight size={18} />
              </button>
            </div>
            <div className="text-center text-xs text-[#8a8175]">안전한 토스 페이먼츠 결제 모듈을 사용합니다.</div>
          </motion.div>
        )}

        {/* STEP 2: 로딩 화면 (중성적 톤 유지) */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-[60vh] space-y-6">
            <motion.div 
              animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }} 
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="w-32 h-32 rounded-full shadow-[0_0_40px_rgba(235,200,180,0.6)] relative overflow-hidden"
            >
              <img src="/images/loading_ball.png" alt="분석 중..." className="w-full h-full object-cover" />
            </motion.div>
            <div className="text-xl font-bold text-center leading-relaxed text-[#2d2822] mt-4">
              다온 원장님이 신중하게<br/>명식을 짚어보고 있습니다...
            </div>
            <div className="text-sm text-[#8a8175] text-center px-6 leading-relaxed">
              "오랜 세월 쌓아온 깊은 내공과 진심 어린 상담으로<br/>당신의 곁에서 등불이 되어드리겠습니다."<br/><span className="text-xs mt-2 block opacity-70">(약 10~15초 소요)</span>
            </div>
            <div className="w-48 h-1 bg-[#ebe5de] rounded-full overflow-hidden mt-2">
              <div className="h-full bg-[#8b7355] w-1/2 animate-pulse" />
            </div>
          </motion.div>
        )}

        {/* STEP 3: 결과 화면 (지피지기 스타일의 다크 퍼플/네이비 프리미엄 UI) */}
        {step === 3 && result && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="py-8 space-y-6">
            
            <div className="text-center mb-10 space-y-2">
               <div className="inline-block px-4 py-1 bg-purple-900/40 text-purple-200 text-[10px] font-bold rounded-full tracking-widest border border-purple-500/30 mb-2">DAON PREMIUM REPORT</div>
               <h2 className="text-2xl font-black text-white leading-tight">{result.title}</h2>
            </div>

            <div className="space-y-5">
              {result.sections && result.sections.map((sec, idx) => (
                <div key={idx} className="bg-[#241b35]/80 backdrop-blur-md border border-[#4d3b73] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                  {/* 상단 뱃지 */}
                  <div className="inline-flex px-3 py-1 bg-black text-white text-xs font-bold rounded-full mb-4 shadow-sm border border-white/10">
                    {sec.badge}
                  </div>
                  
                  {/* 하이라이트 (노란색) */}
                  {sec.highlight && (
                    <div className="text-[#ffd700] font-bold text-sm mb-3 pl-2 border-l-2 border-[#ffd700]">
                      {sec.highlight}
                    </div>
                  )}

                  {/* 본문 (가독성 극대화) */}
                  <div className="text-white/90 text-[15px] leading-[1.85] tracking-[-0.02em] break-keep font-medium">
                    {sec.content.split('\n').map((line, i) => (
                      <p key={i} className="mb-4 last:mb-0">
                        {line.replace(/\*\*/g, '').trim()}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 space-y-6">
              <div className="text-center text-[#d4c8b8] text-sm leading-relaxed px-4 opacity-80 font-medium">
                "다온(多溫) — 많은 온기를 전한다는 뜻처럼,<br/>당신의 마음에 따스한 빛 하나 놓아드리는<br/>상담이 되겠습니다."
              </div>
              <button onClick={() => window.location.reload()} className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
                다른 사주 보러가기
              </button>
            </div>
          </motion.div>
        )}

      </div>

      {/* 플로팅 챗봇 버튼 */}
      <button 
        onClick={() => setIsChatbotOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#2d2822] text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-[#1a1714] transition-colors z-50 border-2 border-[#d4c8b8]/20"
      >
        <MessageCircle size={24} />
      </button>

      {/* 챗봇 FAQ 모달 */}
      {isChatbotOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]" onClick={() => setIsChatbotOpen(false)}>
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-[#2d2822] text-[#faf8f5] p-5 rounded-t-2xl flex justify-between items-center border-b border-[#3d362e]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#faf8f5] text-[#2d2822] flex items-center justify-center font-bold text-sm">다온</div>
                <div>
                  <h3 className="font-bold">다온 챗봇</h3>
                  <p className="text-xs text-[#b0a595]">자주 묻는 질문 (FAQ)</p>
                </div>
              </div>
              <button onClick={() => setIsChatbotOpen(false)} className="text-[#b0a595] hover:text-white text-2xl leading-none">&times;</button>
            </div>
            
            <div className="p-5 space-y-4 bg-[#faf8f5] text-[#2d2822]">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-[#ebe5de]">
                <p className="font-bold text-[15px] mb-2 text-[#8b7355]">Q. 사주 정보는 어떻게 입력하나요?</p>
                <p className="text-sm leading-relaxed text-[#6b6255]">본인의 이름, 성별, 생년월일, 태어난 시간을 정확히 기재해 주세요. 시간을 모르실 경우 빈칸으로 두셔도 연월일 위주로 풀이해 드립니다.</p>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-sm border border-[#ebe5de]">
                <p className="font-bold text-[15px] mb-2 text-[#8b7355]">Q. 무료 운세와 유료 사주는 어떤 차이가 있나요?</p>
                <p className="text-sm leading-relaxed text-[#6b6255]">무료 오늘의 운세는 매일 가볍게 확인할 수 있는 운 흐름입니다. 유료 상품은 고객님의 사주명식을 바탕으로 훨씬 더 깊이 있고 세밀한 프리미엄 분석 리포트를 제공합니다.</p>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-[#ebe5de]">
                <p className="font-bold text-[15px] mb-2 text-[#8b7355]">Q. 취소 및 환불이 가능한가요?</p>
                <p className="text-sm leading-relaxed text-[#6b6255]">제공해 드리는 사주 분석 결과는 즉시 화면에 출력되는 디지털 콘텐츠이므로, 결제가 완료된 이후에는 절대 환불이 불가합니다.</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
