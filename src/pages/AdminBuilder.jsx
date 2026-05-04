import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, RefreshCw, Play, Download, Zap, MessageSquare, Image as ImageIcon, Volume2, Shuffle } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateRandomStylePrompt } from '../utils/styleEngine';
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export default function AdminBuilder() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [currentStyle, setCurrentStyle] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    setCurrentStyle(generateRandomStylePrompt());
  }, []);

  const handleShuffleStyle = () => {
    const newStyle = generateRandomStylePrompt();
    setCurrentStyle(newStyle);
    setStatus(`✨ 테마 변경됨: ${newStyle.koreanName}`);
  };

  const fetchWithRetry = async (url, options) => {
    const response = await fetch(url, options);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${err.error?.message || response.statusText}`);
    }
    return await response.json();
  };

  const generateViralFortune = async () => {
    setLoading(true);
    setStatus('초격차 AI 엔진 가동 중...');
    setGeneratedContent(null);

    try {
      // 1. Gemini 2.5 Flash - 대본 기획
      setStatus('[1단계] Gemini 2.5 Flash로 대본 기획 중...');
      const prompt = `
        너는 수백만 조회수를 기록하는 숏폼 전문가야. 2026년 5월 운세 쇼츠 대본을 작성해줘.
        - 인사말 생략, 강렬한 후킹으로 시작.
        - 12지신 중 행운의 띠와 연도를 선정.
        - 다음 JSON 형식으로만 응답: { "title": "타이틀", "hook": "후킹", "luckyYears": [{"year": "1995년", "animal": "돼지", "emoji": "🐷"}], "ttsScript": "전체 대본" }
      `;
      const textResult = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      );
      
      let rawText = textResult.candidates[0].content.parts[0].text;
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(rawText);

      // 2. Imagen 4.0 - 초고화질 시네마틱 배경 (스타일 엔진 연동)
      setStatus(`[2단계] Imagen 4.0으로 [${currentStyle.koreanName}] 배경 생성 중...`);
      const imgPrompt = currentStyle ? currentStyle.prompt : "9:16 vertical 8k. Epic cosmic explosion of gold and crimson energy, hyper-realistic nebula, particles flying towards camera, luxury aesthetic, intense cinematic lighting, ultra high resolution.";
      
      const imgResult = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            instances: [{ prompt: imgPrompt }] 
          })
        }
      );
      const imageUrl = `data:image/png;base64,${imgResult.predictions[0].bytesBase64Encoded}`;

      // 3. Gemini 3.1 Flash TTS - 명품 목소리
      setStatus('[3단계] Gemini 3.1 TTS로 프리미엄 목소리 합성 중...');
      const ttsResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: data.ttsScript }] }],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } } }
            }
          })
        }
      );
      const ttsData = await ttsResponse.json();
      const audioBase64 = ttsData.candidates[0].content.parts[0].inlineData.data;
      
      setGeneratedContent({ ...data, image: imageUrl, audio: pcmToWav(audioBase64) });
      setStatus('바이럴 마스터피스 완성!');
    } catch (error) {
      console.error(error);
      setStatus(`에러 발생: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const pcmToWav = (base64) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    const writeString = (o, s) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
    writeString(0, 'RIFF'); view.setUint32(4, 36 + binary.length, true); writeString(8, 'WAVE');
    writeString(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
    view.setUint16(22, 1, true); view.setUint32(24, 24000, true); view.setUint32(28, 48000, true);
    view.setUint16(32, 2, true); view.setUint16(34, 16, true); writeString(36, 'data');
    view.setUint32(40, binary.length, true);
    return URL.createObjectURL(new Blob([wavHeader, bytes], { type: 'audio/wav' }));
  };

  const downloadVideo = async () => {
    if (!generatedContent) return;
    setIsExporting(true);
    setStatus('영상 엔진 준비 중...');

    const canvas = document.createElement('canvas');
    canvas.width = 1080; canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    
    const bgImg = new Image();
    bgImg.crossOrigin = "anonymous";
    bgImg.src = generatedContent.image;
    await new Promise(resolve => bgImg.onload = resolve);

    const stream = canvas.captureStream(60);
    const audio = new Audio(generatedContent.audio);
    
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(audio);
    const destination = audioCtx.createMediaStreamDestination();
    source.connect(destination); source.connect(audioCtx.destination);
    
    const combinedStream = new MediaStream([...stream.getVideoTracks(), ...destination.stream.getAudioTracks()]);
    const recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 18000000 });
    const chunks = [];
    
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      setStatus('파일 최종 생성 중...');
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none'; a.href = url; a.download = `Viral_Fortune_Premium_${Date.now()}.webm`;
      document.body.appendChild(a); a.click();
      setTimeout(() => { document.body.removeChild(a); window.URL.revokeObjectURL(url); }, 100);
      setIsExporting(false); setStatus('다운로드 완료! 폴더를 확인하세요.');
    };

    recorder.start();
    audio.play();

    const startTime = Date.now();
    const renderLoop = () => {
      if (audio.paused || audio.ended) { 
        if (recorder.state !== 'inactive') recorder.stop(); 
        return; 
      }

      const elapsed = (Date.now() - startTime) / 1000;
      setStatus(`프리미엄 렌더링 중... (${Math.floor(audio.currentTime)}초 / ${Math.floor(audio.duration)}초)`);

      // 1. 배경 줌 효과 (Dynamic Zoom)
      const scale = 1 + (elapsed * 0.02);
      ctx.save();
      ctx.translate(540, 960);
      ctx.scale(scale, scale);
      ctx.drawImage(bgImg, -540, -960, 1080, 1920);
      ctx.restore();

      // 그라데이션 오버레이
      const grad = ctx.createLinearGradient(0, 0, 0, 1920);
      grad.addColorStop(0, "rgba(0,0,0,0.6)");
      grad.addColorStop(0.5, "rgba(0,0,0,0.2)");
      grad.addColorStop(1, "rgba(0,0,0,0.8)");
      ctx.fillStyle = grad; ctx.fillRect(0, 0, 1080, 1920);

      // 2. 타이틀 스타일 및 자동 줄바꿈 (WrapText)
      const drawWrappedText = (text, x, y, maxWidth, lineHeight) => {
        const words = text.split(' ');
        let line = '';
        const lines = [];

        for (let n = 0; n < words.length; n++) {
          let testLine = line + words[n] + ' ';
          let metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
          } else {
            line = testLine;
          }
        }
        lines.push(line);

        lines.forEach((l, i) => {
          const ly = y + (i * lineHeight) - ((lines.length - 1) * lineHeight / 2);
          ctx.strokeText(l.trim(), x, ly);
          ctx.fillText(l.trim(), x, ly);
        });
      };

      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(255, 0, 0, 0.8)";
      ctx.shadowBlur = 40;
      ctx.strokeStyle = "white";
      ctx.lineWidth = 18;
      ctx.lineJoin = "round";
      ctx.font = "900 130px 'Black Han Sans', sans-serif";
      ctx.fillStyle = "#FF0000";

      drawWrappedText(generatedContent.title, 540, 480, 950, 160);
      ctx.shadowBlur = 0;

      // 3. 행운의 띠 리스트 (카드 스타일)
      generatedContent.luckyYears.forEach((item, i) => {
        const y = 750 + (i * 200);
        
        // 카드 배경
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.roundRect(120, y - 80, 840, 160, 40); ctx.fill(); ctx.stroke();

        // 텍스트
        ctx.fillStyle = "white";
        ctx.font = "bold 75px 'Jua', sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`${item.emoji} ${item.animal}띠`, 180, y + 25);
        
        ctx.textAlign = "right";
        ctx.fillStyle = "#FFD700";
        ctx.font = "900 85px 'Black Han Sans', sans-serif";
        ctx.fillText(item.year, 900, y + 25);
      });

      // 4. 하단 CTA 애니메이션
      const pulse = 1 + Math.sin(elapsed * 4) * 0.03;
      ctx.save();
      ctx.translate(540, 1820);
      ctx.scale(pulse, pulse);
      ctx.fillStyle = "#FFD700";
      ctx.font = "900 55px 'Black Han Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(255, 215, 0, 0.5)";
      ctx.shadowBlur = 20;
      ctx.fillText("👇 댓글 남기고 2026년 대운 잡기 👇", 0, 0);
      ctx.restore();

      requestAnimationFrame(renderLoop);
    };
    renderLoop();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 sm:p-12 flex flex-col items-center font-sans selection:bg-red-500">
      <header className="max-w-4xl w-full mb-16 text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-block px-4 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold tracking-[0.3em] mb-4 border border-red-500/20">
          NEXT-GEN AI STUDIO 2026
        </motion.div>
        <h1 className="text-6xl sm:text-7xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-transparent">
          Viral Master Pro
        </h1>
        <p className="text-neutral-500 text-lg">최첨단 Gemini 3.1 & Imagen 4.0 엔진이 탑재되었습니다.</p>
      </header>

      <main className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-start">
        <div className="space-y-8">
          <div className="bg-neutral-900/50 backdrop-blur-3xl border border-white/5 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
             <div className="flex items-center gap-4 mb-10">
               <div className="p-3 bg-red-500 rounded-2xl shadow-lg shadow-red-500/20"><Zap size={24} className="text-white" /></div>
               <h2 className="text-3xl font-black">AI 제어 센터</h2>
             </div>

             <div className="space-y-6">
                
                {/* 마법의 스타일 셔플 섹션 */}
                {currentStyle && (
                  <div className="p-5 bg-neutral-800/50 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-neutral-400 font-bold tracking-widest mb-1">현재 적용된 테마</div>
                      <div className="text-xl font-black text-yellow-400 drop-shadow-md">{currentStyle.koreanName}</div>
                    </div>
                    <button 
                      onClick={handleShuffleStyle} disabled={loading}
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/20 disabled:opacity-50 flex items-center gap-2"
                      title="랜덤 테마 뽑기"
                    >
                      <Shuffle size={20} /> <span className="font-bold text-sm hidden sm:inline">테마 셔플</span>
                    </button>
                  </div>
                )}

                <button 
                  onClick={generateViralFortune} disabled={loading || !currentStyle}
                  className="group w-full h-24 bg-white text-black rounded-[2rem] font-black text-2xl transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 shadow-xl shadow-white/5 overflow-hidden relative"
                >
                  <span className="relative z-10 flex items-center gap-4">
                    {loading ? <RefreshCw className="animate-spin text-red-500" size={28} /> : <Sparkles size={28} />}
                    {loading ? "하이엔드 에이전트 가동 중..." : "마스터피스 영상 생성"}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-400 opacity-0 group-hover:opacity-10 transition-opacity" />
                </button>

                {status && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-black/40 border border-white/5 rounded-2xl font-mono text-xs space-y-2">
                    <div className="flex items-center gap-2 text-red-500"><div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> SYSTEM STATUS</div>
                    <div className="text-neutral-400">{status}</div>
                  </motion.div>
                )}

                {generatedContent && (
                  <button onClick={downloadVideo} disabled={isExporting} className="w-full h-16 bg-neutral-800 hover:bg-neutral-700 rounded-2xl font-bold flex items-center justify-center gap-3 transition-colors border border-white/5">
                    {isExporting ? <RefreshCw className="animate-spin" size={20} /> : <Download size={20} />}
                    1080p 고화질 비디오 내보내기
                  </button>
                )}
             </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {[
              { icon: MessageSquare, title: "Gemini 2.5", desc: "고도화된 바이럴 대본" },
              { icon: ImageIcon, title: "Imagen 4.0", desc: "8K 시네마틱 이미지" },
              { icon: Volume2, title: "Gemini 3.1", desc: "인간급 AI 보이스" },
              { icon: Zap, title: "BinLab", desc: "수익화 워크플로우" }
            ].map((item, i) => (
              <div key={i} className="p-6 bg-neutral-900/30 border border-white/5 rounded-[2rem] space-y-3">
                <item.icon size={20} className="text-red-500" />
                <div className="font-bold text-sm">{item.title}</div>
                <div className="text-[10px] text-neutral-500 leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center sticky top-12">
          <div className="relative group">
            <div className="absolute -inset-10 bg-red-500/20 blur-[120px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative w-[360px] aspect-[9/16] bg-black rounded-[4rem] border-[12px] border-neutral-900 shadow-5xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]">
               {generatedContent ? (
                 <div className="h-full w-full relative flex flex-col items-center p-8 pt-20">
                   <img src={generatedContent.image} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                   
                   {/* 영상과 동일한 미리보기 레이아웃 */}
                   <div className="relative z-10 w-full flex flex-col items-center space-y-10">
                      <div className="px-4 py-1 bg-red-600 rounded-full text-[8px] font-black tracking-widest uppercase text-white shadow-lg">Special Report</div>
                      
                      <h3 className="text-3xl font-black text-center leading-tight tracking-tighter text-[#FF0000]" 
                          style={{ 
                            fontFamily: "'Black Han Sans', sans-serif",
                            WebkitTextStroke: '1px white',
                            textShadow: '0 0 10px rgba(255,0,0,0.8), 0 0 20px rgba(255,0,0,0.5), -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff' 
                          }}>
                        {generatedContent.title}
                      </h3>

                      <div className="w-full space-y-3">
                        {generatedContent.luckyYears.map((item, i) => (
                          <div key={i} className="flex justify-between items-center bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl">
                            <span className="text-lg font-bold text-white drop-shadow-md">{item.emoji} {item.animal}띠</span>
                            <span className="text-xl font-black text-yellow-400" style={{ fontFamily: "'Black Han Sans', sans-serif" }}>{item.year}</span>
                          </div>
                        ))}
                      </div>

                      <button onClick={() => audioRef.current.play()} className="w-16 h-16 bg-white/20 backdrop-blur-3xl rounded-full flex items-center justify-center border border-white/30 hover:scale-110 transition-transform">
                        <Play fill="white" size={24} className="ml-1" />
                      </button>

                      <div className="text-[10px] font-black text-yellow-400 animate-pulse text-center pt-10" style={{ fontFamily: "'Black Han Sans', sans-serif" }}>
                        👇 댓글 남기고 2026년 대운 잡기 👇
                      </div>
                   </div>
                   <audio ref={audioRef} src={generatedContent.audio} />
                 </div>
               ) : (
                 <div className="h-full w-full flex flex-col items-center justify-center text-neutral-900 font-black text-4xl italic tracking-tighter">
                    VIRAL<br/>STUDIO
                 </div>
               )}
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-24 text-neutral-700 text-[10px] font-bold tracking-[0.5em] uppercase pb-20">
        &copy; 2026 Viral Master Pro &middot; Powered by Imagen 4.0 & Gemini 3.1
      </footer>
    </div>
  );
}
