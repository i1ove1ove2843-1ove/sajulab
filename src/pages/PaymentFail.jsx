import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function PaymentFail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const message = searchParams.get('message') || '결제 중 오류가 발생했습니다.';

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center p-6 text-[#2d2822] text-center">
      <div className="text-5xl mb-6">❌</div>
      <h2 className="text-2xl font-black mb-2">결제에 실패했습니다</h2>
      <p className="text-[#8a8175] mb-8">{message}</p>
      
      <div className="space-y-3 w-full max-w-xs">
        <button 
          onClick={() => navigate('/')}
          className="w-full py-4 bg-[#2d2822] text-white font-bold rounded-xl shadow-lg"
        >
          다시 시도하기
        </button>
        <button 
          onClick={() => window.location.href = 'https://pf.kakao.com/_your_link'}
          className="w-full py-4 bg-white border border-[#ebe5de] text-[#6b6255] font-bold rounded-xl"
        >
          고객 센터 문의하기
        </button>
      </div>
    </div>
  );
}
