import React, { useState, useEffect } from 'react';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { Sparkles, ArrowRight, Heart, Star, BookOpen, Crown, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const TOSS_CLIENT_KEY = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const CATEGORIES = [
  { 
    id: 'free', title: '오늘의 운세 (무료)', price: 0, icon: Sparkles, desc: '오늘 하루 나의 재물운과 애정운', img: '/images/hero.png',
    cta: '지금 바로 무료 운세 보기 →',
    sample: '오늘 당신의 일간 흐름은 화(火)의 기운이 강하게 들어와 활력이 넘치는 하루입니다. 특히 오후 2시경 예상치 못한 기분 좋은 소식이...',
    marketing: {
      title: '무료인데 운세 흐름까지 완벽하게?',
      sub: '오늘 하루 나에게 다가올 행운과 조심해야 할 점을 미리 알아보고 하루를 시작하세요.',
      detail: '단순한 운세가 아닙니다. 다온 원장만의 따뜻한 통찰이 담긴 하루의 가이드를 드립니다.'
    }
  },
  { 
    id: 'love', title: '원포인트 연애운', price: 4900, icon: Heart, desc: '내 사주에 숨겨진 진짜 연애운의 비밀', img: '/images/card_love.png',
    cta: '내 연애운 지금 확인하기 →',
    sample: '당신의 사주 속 식신(食神)이 활발해지는 시기로, 연애에 있어 매력이 극대화됩니다. 상대방과의 관계에서 주도권을 잡게 되며...',
    marketing: {
      title: '왜 나만 연애가 힘들까?\n내 사주에 숨겨진 진짜 연애운의 비밀',
      sub: '"올해는 좋은 사람 만날 수 있을까?"\n"지금 썸타는 그 사람과 나는 인연일까?"',
      detail: '답답했던 연애 고민, 이제 사주 명리학과 트렌디한 웹툰 사주 분석으로 속 시원하게 풀어드립니다.'
    }
  },
  { 
    id: 'basic', title: '원포인트 사주/진로', price: 4900, icon: Star, desc: '4,900원으로 확인하는 나의 핵심 사주', img: '/images/card1.png',
    cta: '내 사주 핵심만 뽑아보기 →',
    sample: '본인의 일간은 갑목(甲木)으로, 강한 리더십과 성취욕을 타고나셨습니다. 현재 대운의 흐름상 전문직이나 기술직 분야에서 큰 결실을...',
    marketing: {
      title: '내 인생의 터닝포인트는 언제일까?\n4,900원으로 확인하는 나의 핵심 사주',
      sub: '"나는 어떤 일을 해야 돈을 잘 벌 수 있을까?"\n"내 성향에 맞는 진로는 무엇일까?"',
      detail: '수십만 원짜리 전체 사주가 부담스러우셨다면, 가장 궁금한 핵심만 쏙쏙 뽑아낸 \'원포인트 사주\'로 진단해 보세요.'
    }
  },
  { 
    id: 'year', title: '2026년 대박 신년운세', price: 9900, icon: BookOpen, desc: '2026년 전체 운과 대운 분석', img: '/images/card2.png',
    cta: '2026년 내 운세 미리 보기 →',
    sample: '2026년은 병오(丙午)년으로, 당신에게는 문서운과 인덕이 함께 들어오는 해입니다. 상반기에는 기존의 문제를 해결하고 하반기부터 본격적인...',
    marketing: {
      title: '2026년, 당신의 해로 만들 준비가 되셨나요?',
      sub: '"내년에는 승진할 수 있을까?"\n"올해보다 금전운이 더 좋아질까?"',
      detail: '1년의 큰 흐름을 꿰뚫어 보는 신년운세. 조심해야 할 달과 기회를 잡아야 할 달을 정확히 짚어드립니다.'
    }
  },
  { 
    id: 'premium', title: '10년 주기 프리미엄 리포트', price: 39000, icon: Crown, desc: '동서양 운명학이 교차 검증한 10년 대운', img: '/images/card4.png',
    cta: '10년 인생 황금기 확인하기 →',
    sample: '사주 대운수 7을 기준으로 현재 47세부터 시작된 정재(正財) 대운은 당신의 인생에서 가장 안정적인 자산 형성의 시기입니다. 점성술상 목성이...',
    marketing: {
      title: '내 인생의 진짜 황금기는 언제일까?\n동서양 운명학이 교차 검증한 10년 대운의 비밀',
      sub: '"지금 하는 이 일이 내 평생 직업이 맞을까?"\n"내 인생에서 가장 돈이 모이는 시기는 언제일까?"',
      detail: '사주 명리학(동양)과 점성술(서양)의 완벽한 크로스 체크! 인생의 거대한 흐름을 프리미엄 PDF 보고서로 소장하세요.'
    }
  },
  { 
    id: 'expert', title: '다온 원장 1:1 프라이빗 심층 상담', price: 50000, icon: MessageCircle, desc: '명식 너머 당신의 삶을 직접 어루만지는 심층 대화', img: '/images/card3.png',
    externalLink: 'https://pf.kakao.com/_your_link' // 카카오톡 채널 등으로 추후 교체 가능
  },
];

export default function CustomerApp() {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState('basic');
  const [form, setForm] = useState({
    name: '', gender: '여', 
    year: '1995', month: '01', day: '01',
    hour: '시간모름', birthType: '양력',
    partnerName: '', partnerBirth: '',
    worry: '', hanjaName: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [todayUsers, setTodayUsers] = useState(200 + Math.floor(Math.random() * 50));
  const APP_URL = "https://sajulab-ten.vercel.app";

  const REVIEWS = [
    { name: "김*희", rating: 5, text: "연애운 보고 소름 돋았어요. 원장님 풀이가 너무 따뜻하네요." },
    { name: "박*준", rating: 5, text: "재물운 분석대로 이직 성공했습니다. 10년 리포트 강추해요!" },
    { name: "이*영", rating: 5, text: "무료 운세만 보려다가 4900원 결제했는데 돈이 아깝지 않아요." },
    { name: "최*서", rating: 4, text: "내용이 엄청 기네요. 저장해두고 계속 보려고요." },
    { name: "정*민", rating: 5, text: "딱딱한 한자가 아니라 웹툰처럼 술술 읽혀서 좋았습니다." }
  ];

  const LOADING_MESSAGES = [
    "다온 원장님이 신중하게 명식을 짚어보고 있습니다...",
    "Gemini 2.5 Flash가 수만 개의 사주 패턴을 분석 중입니다...",
    "당신만을 위한 따뜻한 인생 가이드를 작성하고 있습니다...",
    "최종 분석 리포트 생성을 마무리하고 있습니다..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setReviewIdx(prev => (prev + 1) % REVIEWS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const selectedCat = CATEGORIES.find(c => c.id === category);

  const fetchWithRetry = async (url, options) => {
    const response = await fetch(url, options);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${err.error?.message || response.statusText}`);
    }
    return await response.json();
  };

  const isValidDate = (y, m, d) => {
    const year = parseInt(y);
    const month = parseInt(m) - 1;
    const day = parseInt(d);
    const date = new Date(year, month, day);
    return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
  };

  const handlePayment = async () => {
    // Ticket 5: 입력값 유효성 검증 강화
    if (!form.name.trim()) { alert("성함을 입력해주세요."); return; }
    if (form.name.length < 2) { alert("성함을 정확히 입력해주세요."); return; }
    if (!isValidDate(form.year, form.month, form.day)) { 
      alert("존재하지 않는 날짜입니다. 생년월일을 다시 확인해주세요."); 
      return; 
    }
    
    // Ticket 6: 카테고리별 조건부 필드 검증 (연애운 선택 시 상대 정보 권장)
    if (category === 'love' && (!form.partnerName || !form.partnerBirth)) {
      if (!confirm("상대방 정보가 입력되지 않았습니다. 상대방 정보 없이 본인의 연애 성향만 분석할까요?")) {
        return;
      }
    }
    
    try {
      // Ticket 4: 결제 후 분석을 위해 데이터 저장
      localStorage.setItem('daon_form', JSON.stringify(form));
      localStorage.setItem('daon_category', JSON.stringify(selectedCat));

      if (selectedCat.price > 0) {
        const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
        await tossPayments.requestPayment('카드', {
          amount: selectedCat.price,
          orderId: `order_${Math.random().toString(36).substr(2, 9)}`,
          orderName: selectedCat.title,
          successUrl: window.location.origin + '/payment/success',
          failUrl: window.location.origin + '/payment/fail',
        });
      } else {
        // 무료 상품의 경우 바로 분석 페이지로 이동
        setLoading(true);
        setStep(2);
        
        // 가이드 기반 몰입 하이브리드 프롬프트 (무료 버전)
        const modelContext = `너는 50년 경력의 명리학자 '다온'이다. 
          사주는 일간(본인)을 중심으로 주변 기운을 읽는다. 
          서두 없이 '바로 본론'으로 들어가고, 말투는 부드럽지만 단정적으로 말한다. 
          사용자가 "와, 소름 돋는다"라고 느낄 만큼 현실적인 디테일을 담아 분석한다.`;
        
        const prompt = `${modelContext}
          고객 정보: 이름: ${form.name}, 성별: ${form.gender}, 생년월일: ${form.year}-${form.month}-${form.day} (${form.birthType}), 태어난 시간: ${form.hour}. 
          카테고리: ${selectedCat.title}. 
          
          반드시 아래의 JSON 형식으로만 응답해.
          {
            "title": "가슴을 찌르는 강렬한 한 줄 타이틀",
            "sections": [
              { "badge": "분석 영역", "content": "300자 내외의 구체적이고 단정적인 분석", "highlight": "핵심 디테일" }
            ],
            "upsellHook": "더 유료 분석이 궁금해질 결정적 한마디 (예: 그런데 당신의 재물운에는 아직 말하지 못한 치명적인 반전이 하나 더 있습니다)"
          }`;
        
        // 로컬 환경용 자동 우회 로직 (Ticket 8)
        const isLocal = window.location.hostname === 'localhost';
        let analyzeRes;
        
        try {
          analyzeRes = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, category: selectedCat.id }),
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
          throw new Error('서버 응답 형식이 올바르지 않습니다.');
        }

        if (!analyzeRes.ok) {
          const errorDetail = await analyzeRes.text();
          throw new Error(`서버 에러 (${analyzeRes.status}): ${errorDetail.substring(0, 50)}...`);
        }

        const content = isLocal && !analyzeData.content ? analyzeData.candidates?.[0]?.content?.parts?.[0]?.text : analyzeData.content;
        
        // 강력한 JSON 추출 로직 (Ticket 6 보강)
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (!jsonMatch) throw new Error('JSON 형식을 찾을 수 없습니다.');
          const cleanJson = jsonMatch[0].trim();
          setResult(JSON.parse(cleanJson));
          setLoading(false);
          setStep(3);
        } catch (e) {
          console.error('AI 응답 파싱 에러:', content);
          // 디버깅을 위해 실제 응답 내용을 일부 포함하여 에러 출력
          const snippet = content ? content.substring(0, 100) + '...' : '응답 없음';
          throw new Error(`분석 결과를 읽지 못했습니다. (AI 응답: ${snippet}) 사유: ${e.message}`);
        }
      }
    } catch (e) {
      console.error(e);
      alert("진행 중 오류가 발생했습니다: " + e.message);
      setLoading(false);
      setStep(1);
    }
  };

  return (
    <div className={`min-h-screen font-sans relative transition-colors duration-700 ${step === 3 ? 'bg-gradient-to-br from-[#fff5eb] via-[#f9e0d9] to-[#e6d0d9] text-[#3e2c22]' : 'bg-[#faf8f5] text-neutral-900'}`}>
      
      <div className="max-w-md mx-auto w-full p-6 relative z-10 min-h-screen flex flex-col justify-center">
        
        {step === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 py-6 pb-24">
            
            <div className="text-center space-y-4 mb-4">
              <h1 className="text-4xl font-black tracking-tight text-[#2d2822]">다온명리원</h1>
              <div className="flex items-center justify-center gap-1 text-sm font-bold text-[#8b7355]">
                <div className="flex">{"⭐".repeat(5)}</div>
                <span>평점 4.9</span>
                <span className="mx-2 text-neutral-300">|</span>
                <span>누적 2,847+ 이용</span>
                <span className="ml-2 text-red-500 animate-pulse flex items-center gap-1">
                  <span className="text-[6px]">●</span> 오늘 {todayUsers}명 이용 중
                </span>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white/60 relative overflow-hidden h-24 flex flex-col justify-center shadow-sm">
              <div className="text-[10px] font-bold text-[#8b7355] mb-1">실시간 리얼 후기</div>
              <motion.div key={reviewIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-xs text-[#2d2822] font-medium leading-relaxed pr-12">
                "{REVIEWS[reviewIdx].text}" - <span className="opacity-60">{REVIEWS[reviewIdx].name}</span>
              </motion.div>
              <div className="absolute right-4 bottom-4 flex gap-2">
                <button onClick={() => setReviewIdx(p => (p-1+REVIEWS.length)%REVIEWS.length)} className="w-6 h-6 bg-white rounded-full shadow-sm text-[10px] flex items-center justify-center">〈</button>
                <button onClick={() => setReviewIdx(p => (p+1)%REVIEWS.length)} className="w-6 h-6 bg-white rounded-full shadow-sm text-[10px] flex items-center justify-center">〉</button>
              </div>
            </div>

            <div onClick={() => { setCategory('free'); setStep(1); }} className="relative w-full h-56 rounded-3xl overflow-hidden cursor-pointer shadow-lg group">
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

            <div className="grid grid-cols-2 gap-4">
              {CATEGORIES.slice(1).map(cat => (
                <div key={cat.id} onClick={() => { cat.externalLink ? window.open(cat.externalLink, '_blank') : (setCategory(cat.id), setStep(1)); }} className="relative h-48 rounded-2xl overflow-hidden cursor-pointer shadow-md group">
                  <img src={cat.img} alt={cat.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4">
                    <div className="text-[#d4c8b8] font-bold text-xs mb-1">{cat.price.toLocaleString()}원</div>
                    <div className="text-white font-bold leading-tight mb-1 break-keep flex items-center gap-1">
                      {cat.title} {cat.externalLink && <ArrowRight size={12} className="opacity-70" />}
                    </div>
                    <div className="text-white/60 text-[10px] leading-tight line-clamp-2 break-keep">{cat.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 1 && selectedCat && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 py-6 pb-24">
            <div className="space-y-4">
              <button onClick={() => setStep(0)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#2d2822] hover:bg-neutral-50 transition-colors">
                <ArrowRight size={20} className="rotate-180" />
              </button>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#ebe5de] text-center space-y-4">
                <h3 className="text-xl font-black text-[#2d2822] whitespace-pre-wrap leading-tight">{selectedCat.marketing?.title || selectedCat.title}</h3>
                <div className="text-[#8b7355] text-sm font-bold bg-[#f0eae1] p-4 rounded-xl whitespace-pre-wrap leading-relaxed">{selectedCat.marketing?.sub || selectedCat.desc}</div>
                <p className="text-[#6b6255] text-xs leading-relaxed break-keep">{selectedCat.marketing?.detail}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#ebe5de]">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-[#8b7355]" />
                <span className="font-bold text-[#4a4238] text-sm">이런 식으로 분석해 드려요!</span>
              </div>
              <div className="bg-gradient-to-br from-[#2d2822] to-[#4a4238] rounded-xl p-5 text-white relative overflow-hidden shadow-inner min-h-[140px]">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px] flex flex-col items-center justify-center z-10 p-4 text-center">
                   <div className="text-2xl mb-2">🔒</div>
                   <div className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/30 text-white font-bold text-xs shadow-xl">결제 완료 후 전체 내용 확인 가능</div>
                </div>
                <div className="opacity-40 space-y-3 pointer-events-none select-none filter blur-[1px]">
                  <div className="inline-block px-2 py-1 bg-white/10 text-white text-[10px] font-bold rounded-full border border-white/20">분석 예시</div>
                  <div className="text-[13px] leading-relaxed break-all">{selectedCat.sample}</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#ebe5de] space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#6b6255]">성함</label>
                <input type="text" placeholder="성함을 입력하세요" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-[#fdfcfb] shadow-inner border border-[#e3dcd3] rounded-xl px-4 py-3 text-[#2d2822] focus:outline-none focus:border-[#8b7355]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#6b6255]">성별</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setForm({...form, gender: '여'})} className={`py-3 rounded-xl font-bold text-sm border transition-all ${form.gender === '여' ? 'bg-[#2d2822] text-white border-[#2d2822]' : 'bg-white text-[#6b6255] border-[#e3dcd3]'}`}>여성</button>
                    <button onClick={() => setForm({...form, gender: '남'})} className={`py-3 rounded-xl font-bold text-sm border transition-all ${form.gender === '남' ? 'bg-[#2d2822] text-white border-[#2d2822]' : 'bg-white text-[#6b6255] border-[#e3dcd3]'}`}>남성</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#6b6255]">양력/음력</label>
                  <select value={form.birthType} onChange={e => setForm({...form, birthType: e.target.value})} className="w-full bg-[#fdfcfb] border border-[#e3dcd3] rounded-xl px-3 py-3 text-sm font-bold"><option>양력</option><option>음력</option></select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#6b6255]">생년월일</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="년(1995)" 
                      min="1900"
                      max="2026"
                      value={form.year} 
                      onChange={e => setForm({...form, year: e.target.value})} 
                      className="w-full bg-[#fdfcfb] border border-[#e3dcd3] rounded-xl px-3 py-3 text-sm focus:border-[#8b7355] outline-none transition-all" 
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#aaa]">년</span>
                  </div>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="월" 
                      min="1"
                      max="12"
                      value={form.month} 
                      onChange={e => setForm({...form, month: e.target.value})} 
                      className="w-full bg-[#fdfcfb] border border-[#e3dcd3] rounded-xl px-3 py-3 text-sm focus:border-[#8b7355] outline-none transition-all" 
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#aaa]">월</span>
                  </div>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="일" 
                      min="1"
                      max="31"
                      value={form.day} 
                      onChange={e => setForm({...form, day: e.target.value})} 
                      className="w-full bg-[#fdfcfb] border border-[#e3dcd3] rounded-xl px-3 py-3 text-sm focus:border-[#8b7355] outline-none transition-all" 
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#aaa]">일</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#6b6255]">태어난 시간</label>
                <select value={form.hour} onChange={e => setForm({...form, hour: e.target.value})} className="w-full bg-[#fdfcfb] border border-[#e3dcd3] rounded-xl px-3 py-3 text-sm">
                  <option>시간모름</option>
                  {Array.from({length: 24}).map((_, i) => (<option key={i}>{i}시</option>))}
                </select>
              </div>
              {category === 'worry' && (
                <div className="space-y-2 pt-4 border-t border-[#f0eae1]">
                  <label className="text-xs font-bold text-[#6b6255]">고민 내용</label>
                  <textarea rows="3" placeholder="예: 현재 직장 문제로 고민 중입니다..." value={form.worry} onChange={e => setForm({...form, worry: e.target.value})} className="w-full bg-[#fdfcfb] border border-[#e3dcd3] rounded-xl px-4 py-3 text-sm resize-none" />
                </div>
              )}
              <div className="pt-2 pb-1 space-y-2">
                <div className="flex items-center justify-center gap-2 text-[10px] text-[#8b7355] font-bold">
                  <span className="w-1 h-1 bg-[#8b7355] rounded-full"></span>
                  안전한 토스 페이먼츠 결제 시스템 적용
                  <span className="w-1 h-1 bg-[#8b7355] rounded-full"></span>
                </div>
                <button onClick={handlePayment} className="w-full bg-gradient-to-r from-[#2d2822] to-[#4a4238] hover:scale-[1.02] text-white font-black py-4 rounded-xl shadow-xl transition-all active:scale-95">
                  {selectedCat.cta}
                </button>
                <p className="text-center text-[9px] text-[#aaa] font-medium">분석 결과는 즉시 제공되며, 개인정보는 1:1 암호화 처리됩니다.</p>
              </div>
            </div>
            <div className="bg-white/50 p-4 rounded-xl text-[10px] text-[#8a8175] space-y-2 border border-[#ebe5de] mt-4">
              <div className="font-bold text-[#6b6255]">⚠️ 환불 및 취소 규정 (필독)</div>
              <p className="leading-relaxed">본 상품은 고객님의 고유한 생년월일 정보를 바탕으로 1:1 맞춤 제작되어 발송되는 디지털 콘텐츠입니다. 결과물이 발송된 이후에는 교환 및 환불이 절대 불가합니다.</p>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-[60vh] space-y-6">
            <motion.div animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="w-32 h-32 rounded-full shadow-[0_0_50px_rgba(235,200,180,0.8)] relative overflow-hidden">
              <img src="/images/loading_ball.png" alt="분석 중..." className="w-full h-full object-cover" />
            </motion.div>
            <div className="text-xl font-bold text-center leading-relaxed text-[#2d2822] mt-4 min-h-[3rem]">{LOADING_MESSAGES[loadingStep]}</div>
            <div className="w-56 h-1.5 bg-[#ebe5de] rounded-full overflow-hidden mt-2 shadow-inner">
              <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 15, ease: "linear" }} className="h-full bg-gradient-to-r from-[#8b7355] to-[#2d2822]" />
            </div>
            <p className="text-[10px] text-neutral-400 font-bold tracking-widest uppercase">Gemini 2.5 Flash Thinking Mode</p>
          </motion.div>
        )}

        {step === 3 && result && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="py-8 space-y-6">
            <div className="text-center mb-10 space-y-2">
               <div className="inline-block px-4 py-1 bg-[#d28b71]/10 text-[#b05a3b] text-[10px] font-bold rounded-full tracking-widest border border-[#d28b71]/20 mb-2 shadow-sm uppercase">Daon Premium Report</div>
               <h2 className="text-2xl font-black text-[#3e2c22] leading-tight">{result.title}</h2>
            </div>
            <div className="space-y-5">
              {result.sections && result.sections.map((sec, idx) => (
                <div key={idx} className="bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  <div className="inline-flex px-3 py-1 bg-[#8b7355] text-white text-xs font-bold rounded-full mb-4 shadow-sm">{sec.badge}</div>
                  {sec.highlight && (<div className="text-[#a0522d] font-bold text-sm mb-3 pl-3 border-l-2 border-[#a0522d] bg-[#a0522d]/5 p-2 rounded-r-lg">{sec.highlight}</div>)}
                  <div className="text-[#4a3f35] text-[15px] leading-[1.85] tracking-[-0.02em] break-keep font-medium">
                    {sec.content.split('\n').map((line, i) => (<p key={i} className="mb-4 last:mb-0">{line.replace(/\*\*/g, '').trim()}</p>))}
                  </div>
                </div>
              ))}

              {/* AI Upsell Hook 카드 추가 (Ticket 9) */}
              {result.upsellHook && (
                <div className="bg-gradient-to-br from-[#2d2822] to-[#4a4238] rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden border border-white/10 mt-6">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-yellow-400">✨</span>
                      <span className="text-[10px] font-bold tracking-widest opacity-80 uppercase">AI Insight Deep Dive</span>
                    </div>
                    <p className="text-[15px] font-bold leading-relaxed opacity-95 italic">
                      "{result.upsellHook}"
                    </p>
                    <div className="mt-4 flex justify-end">
                      <button 
                        onClick={() => setStep(1)}
                        className="text-[11px] font-bold border-b border-white/50 pb-0.5 hover:border-white transition-all"
                      >
                        이 부분 더 자세히 알아보기 →
                      </button>
                    </div>
                  </div>
                  <div className="absolute -right-4 -bottom-4 opacity-10 scale-150 pointer-events-none transform -rotate-12">
                    🌅
                  </div>
                </div>
              )}
            </div>
            <div className="pt-8 space-y-6">
              {(category === 'basic' || category === 'love') && (
                <div className="bg-gradient-to-r from-[#ffd700] to-[#ffa500] p-5 rounded-2xl shadow-xl relative overflow-hidden flex flex-col gap-1 border-2 border-white/50">
                  <div className="text-[10px] font-black text-black/60 tracking-tighter">PREMIUM UPSELL 🎁</div>
                  <div className="font-black text-lg text-black leading-tight">결제자 한정 20% 할인 쿠폰!</div>
                  <button className="bg-black text-white text-xs font-black py-2 rounded-lg shadow-lg mt-2">10년 대운 리포트 할인받기</button>
                </div>
              )}
              {/* 프리미엄 1:1 프라이빗 상담 업셀링 배너 (엑스퍼트 대체) */}
              <div className="bg-gradient-to-br from-[#2d2822] to-[#4a4238] rounded-2xl p-6 shadow-2xl relative overflow-hidden border border-white/10">
                <div className="relative z-10 space-y-3">
                  <div className="inline-block px-3 py-1 bg-[#d28b71] text-white text-[10px] font-bold rounded-full shadow-sm uppercase tracking-widest">Premium 1:1 Private</div>
                  <h4 className="text-white font-black text-lg leading-tight">AI 분석으로 다 채워지지 않는<br/>당신만의 깊은 고민이 있다면?</h4>
                  <p className="text-white/70 text-xs leading-relaxed">수많은 이들의 운명을 바꾼 다온 원장이<br/>직접 당신의 목소리에 귀 기울입니다.</p>
                  <button 
                    onClick={() => window.open('https://pf.kakao.com/_your_link', '_blank')} 
                    className="w-full bg-[#fdfcfb] text-[#2d2822] font-black py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 mt-2 transition-transform active:scale-95"
                  >
                    프라이빗 상담 문의하기 <ArrowRight size={18} />
                  </button>
                </div>
                <div className="absolute right-[-20px] bottom-[-20px] text-7xl opacity-10 transform -rotate-12 select-none">💬</div>
              </div>
              <button onClick={() => window.location.reload()} className="w-full py-4 bg-white/40 border border-black/10 text-[#2d2822] font-bold rounded-xl hover:bg-white/60 shadow-sm transition-colors">처음으로 돌아가기</button>
            </div>
          </motion.div>
        )}
      </div>

      <button onClick={() => setIsChatbotOpen(true)} className="fixed bottom-6 right-6 w-14 h-14 bg-[#2d2822] text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-[#1a1714] transition-colors z-50 border-2 border-[#d4c8b8]/20"><MessageCircle size={24} /></button>
      {isChatbotOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]" onClick={() => setIsChatbotOpen(false)}>
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-[#2d2822] text-[#faf8f5] p-5 rounded-t-2xl flex justify-between items-center border-b border-[#3d362e]">
              <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-[#faf8f5] text-[#2d2822] flex items-center justify-center font-bold text-sm">다온</div><div><h3 className="font-bold">다온 챗봇</h3><p className="text-xs text-[#b0a595]">자주 묻는 질문 (FAQ)</p></div></div>
              <button onClick={() => setIsChatbotOpen(false)} className="text-[#b0a595] hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <div className="p-5 space-y-4 bg-[#faf8f5] text-[#2d2822]">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-[#ebe5de]"><p className="font-bold text-[15px] mb-2 text-[#8b7355]">Q. 사주 정보는 어떻게 입력하나요?</p><p className="text-sm leading-relaxed text-[#6b6255]">본인의 이름, 성별, 생년월일, 시간을 정확히 기재해 주세요.</p></div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-[#ebe5de]"><p className="font-bold text-[15px] mb-2 text-[#8b7355]">Q. 취소 및 환불이 가능한가요?</p><p className="text-sm leading-relaxed text-[#6b6255]">디지털 콘텐츠 특성상 결제 후에는 환불이 불가합니다.</p></div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
