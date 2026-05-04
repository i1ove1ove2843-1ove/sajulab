import React, { useState } from 'react';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const TOSS_CLIENT_KEY = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq"; // 토스 테스트 키

export default function CustomerApp() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', birth: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const APP_URL = "https://sajulab.vercel.app";

  const handleCopyLink = async (platform) => {
    let copyText = "";
    if (platform === 'threads') {
      copyText = `✨ 정통 다온명리원\n이름이랑 생년월일만 넣으면 수십 년 경력의 다온 원장님이 사주를 짚어줘\n👇 한 번 해봐\n\n🔗 ${APP_URL}\n\n#사주 #운세 #오늘의운세 #연애운 #다온원장님`;
    } else if (platform === 'daangn') {
      copyText = `📌 정통 다온명리원\n이름이랑 생년월일 넣으면 다온 원장님이 직접 사주 명식을 분석해줘요!\n✅ 가입 없이 바로 사용\n관심 있으신 분들 링크 남겨드려요 🙂\n👉 ${APP_URL}`;
    } else if (platform === 'shorts') {
      copyText = `다온명리원 프리미엄 사주 📲\n이름이랑 생년월일만 넣으면 끝!\n내 타고난 운명과 흐름 완전 분석\n\n👉 프로필 링크 클릭!\n\n#사주 #운세 #오늘의운세 #연애운 #재물운 #사주풀이 #숏츠`;
    }
    
    try {
      await navigator.clipboard.writeText(copyText);
      alert(`${platform} 홍보 문구와 링크가 복사되었습니다! 바로 붙여넣기 하세요.`);
    } catch (e) {
      alert("복사 실패. 다시 시도해주세요.");
    }
  };

  const handlePayment = async () => {
    if (!form.name || !form.birth) {
      alert("이름과 생년월일을 입력해주세요.");
      return;
    }
    
    try {
      const toss = await loadTossPayments(TOSS_CLIENT_KEY);
      
      // 실제 환경에서는 결제 모달이 뜨지만, 현재 로컬 테스트이므로 임시로 넘깁니다.
      // toss.requestPayment("카드", { ... }) 가 실행되면 결제창이 열립니다.
      
      // 시뮬레이션: 결제가 성공했다고 가정하고 결과 생성으로 넘어감
      setLoading(true);
      setStep(2);
      
      // 가상의 AI 분석 지연 시간
      setTimeout(() => {
        setResult({
          title: `${form.name}님의 2026년 대운 분석`,
          content: "올해는 물의 기운이 강하게 들어오는 시기입니다. 막혔던 재물운이 트이고 새로운 귀인을 만나게 될 확률이 높습니다. 특히 5월과 9월에 큰 기회가 찾아오니 적극적으로 움직이세요.",
          luckyItem: "푸른색 지갑",
          luckyColor: "Navy"
        });
        setLoading(false);
        setStep(3);
      }, 3000);
      
    } catch (e) {
      console.error(e);
      alert("결제 초기화에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0c29] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* 배경 장식 */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/30 blur-[100px] rounded-full mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/30 blur-[100px] rounded-full mix-blend-screen" />

      <div className="w-full max-w-md relative z-10">
        
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="text-center space-y-3">
              <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                다온명리원
              </h1>
              <p className="text-gray-300">수십 년 경력의 다온 원장님이 당신의 운명과 흐름을 깊이 있게 풀어냅니다</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300 ml-1">이름</label>
                <input 
                  type="text" placeholder="홍길동"
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300 ml-1">생년월일 (8자리)</label>
                <input 
                  type="text" placeholder="19950505"
                  value={form.birth} onChange={e => setForm({...form, birth: e.target.value})}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="bg-purple-900/40 border border-purple-500/30 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-purple-200">프리미엄 사주 분석</div>
                  <div className="text-xs text-purple-300/70">연애운, 재물운, 2026년 대운 포함</div>
                </div>
                <div className="font-black text-xl">4,900원</div>
              </div>

              <button 
                onClick={handlePayment}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
              >
                결제하고 바로 분석하기 <ArrowRight size={18} />
              </button>
            </div>
            
            <div className="text-center text-xs text-gray-500">
              안전한 토스 페이먼츠 결제 모듈을 사용합니다.
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-64 space-y-6">
            <Sparkles className="animate-spin text-purple-400" size={48} />
            <div className="text-xl font-bold text-center leading-relaxed">
              다온 원장님이 신중하게<br/>{form.name}님의 명식을 짚어보고 있습니다...
            </div>
            <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 w-1/2 animate-pulse" />
            </div>
          </motion.div>
        )}

        {step === 3 && result && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                <CheckCircle2 className="text-green-400" size={32} />
              </div>
              <h2 className="text-2xl font-black">{result.title}</h2>
            </div>

            <div className="bg-white text-black p-8 rounded-3xl shadow-2xl space-y-6">
              <p className="leading-relaxed text-gray-700 text-lg">
                {result.content}
              </p>
              
              <div className="pt-6 border-t border-gray-100 flex gap-4">
                <div className="flex-1 bg-purple-50 p-4 rounded-2xl">
                  <div className="text-xs font-bold text-purple-600 mb-1">행운의 아이템</div>
                  <div className="font-black text-gray-900">{result.luckyItem}</div>
                </div>
                <div className="flex-1 bg-blue-50 p-4 rounded-2xl">
                  <div className="text-xs font-bold text-blue-600 mb-1">행운의 컬러</div>
                  <div className="font-black text-gray-900">{result.luckyColor}</div>
                </div>
              </div>

              {/* 바이럴 SNS 공유 섹션 */}
              <div className="pt-6 border-t border-gray-100">
                <div className="text-center font-bold text-gray-800 mb-4 text-sm">친구에게 소문내고 내일 운세 무료로 보기 🎁</div>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => handleCopyLink('threads')} className="py-3 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition-colors">
                    🧵 스레드 복사
                  </button>
                  <button onClick={() => handleCopyLink('daangn')} className="py-3 bg-[#FF6F0F] text-white text-xs font-bold rounded-xl hover:bg-[#E55F00] transition-colors">
                    🥕 당근마켓 복사
                  </button>
                  <button onClick={() => handleCopyLink('shorts')} className="py-3 bg-[#FF0000] text-white text-xs font-bold rounded-xl hover:bg-[#CC0000] transition-colors">
                    ▶️ 숏츠 복사
                  </button>
                </div>
              </div>
            </div>

            <button onClick={() => window.location.reload()} className="w-full py-4 text-gray-400 font-bold hover:text-white transition-colors">
              처음으로 돌아가기
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}
