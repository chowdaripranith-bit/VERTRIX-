import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Mic, MicOff, Volume2, Square, Send, Sparkles, 
  ThumbsUp, ThumbsDown, CheckCircle2, AlertCircle, 
  HelpCircle, RefreshCw, MessageSquare, BookOpen, ShieldCheck,
  Plus, RotateCcw
} from 'lucide-react';
import { 
  askVoiceAssistant, 
  getAssistantHistory, 
  clearAssistantHistory, 
  submitAssistantFeedback 
} from '../services/api';

const SAMPLE_QUESTIONS = {
  te: [
    "వరి పంటలో ఆకుమచ్చ మరియు అగ్గితెగులు ఎలా నివారించాలి?",
    "పత్తిలో గులాబీ రంగు కాయతొలుచు పురుగు నివారణ ఏమిటి?",
    "వరిలో నీటి పొదుపు కోసం AWD పద్ధతి ఎలా అమలు చేయాలి?",
    "టమోటాలో ఆకుముడుత తెగులు నివారణకు సరైన మందులు ఏమిటి?"
  ],
  hi: [
    "धान में झुलसा (ब्लास्ट) रोग का नियंत्रण कैसे करें?",
    "कपास में गुलाबी सुंडी (Pink Bollworm) से कैसे बचें?",
    "धान में पानी की बचत के लिए एडब्ल्यूडी (AWD) कैसे काम करता है?",
    "टमाटर में अगेती झुलसा रोग के उपचार हेतु क्या करें?"
  ],
  ta: [
    "நெல் பயிரில் குலை நோயை எவ்வாறு கட்டுப்படுத்துவது?",
    "பருத்தியில் இளஞ்சிவப்பு காய்ப்புழுவை கட்டுப்படுத்த வழி என்ன?",
    "நெல்லில் நீர் சேமிப்புக்கு காய்ச்சலும் பாய்ச்சலும் முறை என்றால் என்ன?",
    "தக்காளியில் இலை கருகல் நோய்க்கு தீர்வு என்ன?"
  ],
  kn: [
    "ಭತ್ತದಲ್ಲಿ ಬ್ಲಾಸ್ಟ್ ರೋಗ ನಿಯಂತ್ರಣಕ್ಕೆ ಪರಿಹಾರವೇನು?",
    "ಹತ್ತಿಯಲ್ಲಿ ಗುಲಾಬಿ ಕಾಯಿ ಕೊರೆಯುವ ಹುಳು ನಿರ್ವಹಣೆ ಹೇಗೆ?",
    "ಭತ್ತದಲ್ಲಿ ನೀರಿನ ಉಳಿತಾಯಕ್ಕೆ AWD ಪದ್ಧತಿ ಹೇಗೆ ಬಳಸಬೇಕು?",
    "ಟೊಮೆಟೊ ಮುಂಚಿನ ಅಂಗಮಾರಿ ರೋಗಕ್ಕೆ ಸೂಕ್ತ ಚಿಕಿತ್ಸೆ ಏನು?"
  ],
  ml: [
    "നെല്ലിലെ ബ്ലാസ്റ്റ് രോഗം എങ്ങനെ തടയാം?",
    "പരുത്തിയിലെ കീടങ്ങളെ എങ്ങനെ നിയന്ത്രിക്കാം?",
    "നെൽകൃഷിയിൽ AWD ജല സംരക്ഷണ രീതി എങ്ങനെ നടപ്പാക്കാം?",
    "തക്കാളിയിലെ ഇലകരിച്ചിൽ രോഗത്തിനുള്ള പ്രതിവിധി എന്താണ്?"
  ],
  en: [
    "Hi, how are you?",
    "I grow cotton on two acres.",
    "The leaves are turning yellow.",
    "Can I save water at the same time?",
    "Now explain how a transistor works."
  ]
};

const LANG_LOCALES = {
  en: 'en-IN',
  te: 'te-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  kn: 'kn-IN',
  ml: 'ml-IN'
};

export default function AIAssistant() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const [sessionId, setSessionId] = useState(() => {
    let sid = localStorage.getItem('veltrix_chat_session_id');
    if (!sid) {
      sid = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      localStorage.setItem('veltrix_chat_session_id', sid);
    }
    return sid;
  });

  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: t('assistant.subtitle') || "Hello! I am your AI Agronomist & Conversational Assistant. How can I help you today?",
      sources: ["ICAR Agronomic Guidelines", "National Agritech Extension"],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeFeedbackIndex, setActiveFeedbackIndex] = useState(null);
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState('');
  
  const recognitionRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Restore stored session conversation history from server
  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      if (!sessionId) return;
      try {
        const res = await getAssistantHistory(sessionId);
        if (isMounted && res.data && res.data.messages && res.data.messages.length > 0) {
          const loaded = res.data.messages.map(m => ({
            sender: m.role,
            text: m.content,
            sources: m.sources,
            reusedNotice: m.reused_notice,
            disclaimer: m.disclaimer,
            timestamp: m.timestamp
          }));
          setMessages(loaded);
        }
      } catch (err) {
        console.warn("Notice: Starting with fresh session state:", err);
      }
    };
    fetchHistory();
    return () => { isMounted = false; };
  }, [sessionId]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = LANG_LOCALES[currentLang] || 'en-IN';

      recognition.onstart = () => setIsListening(true);
      
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setQuestion(transcript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition notice:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [currentLang]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Microphone speech recognition is not supported in this browser. Please type your question.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = LANG_LOCALES[currentLang] || 'en-IN';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Microphone start failed:", err);
      }
    }
  };

  const handleSpeak = (text) => {
    if (!('speechSynthesis' in window)) {
      alert("Speech synthesis not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_LOCALES[currentLang] || 'en-IN';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleNewChat = async () => {
    try {
      if (sessionId) {
        await clearAssistantHistory(sessionId);
      }
    } catch (e) {
      console.warn("Clear session notice:", e);
    }
    const newSid = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    localStorage.setItem('veltrix_chat_session_id', newSid);
    setSessionId(newSid);
    setMessages([
      {
        sender: 'assistant',
        text: "Started a new conversation! I'm ready to help with your farm planning, crop care, or any questions.",
        sources: ["ICAR Agronomic Guidelines", "National Agritech Extension"],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleAsk = async (queryText) => {
    const q = (queryText || question).trim();
    if (!q) return;

    // Add user message
    const userMsg = {
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);
    setFeedbackSuccessMsg('');

    try {
      const res = await askVoiceAssistant({
        question: q,
        language: currentLang,
        session_id: sessionId
      });

      if (res.data.session_id && res.data.session_id !== sessionId) {
        setSessionId(res.data.session_id);
        localStorage.setItem('veltrix_chat_session_id', res.data.session_id);
      }

      const assistantMsg = {
        sender: 'assistant',
        text: res.data.answer,
        sources: res.data.evidence_sources,
        reusedNotice: res.data.reused_solution_notice,
        matchedId: res.data.matched_verified_solution_id,
        disclaimer: res.data.disclaimer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Assistant error:', err);
      const errorMsg = {
        sender: 'assistant',
        text: "Apologies, the agricultural advisory service could not be reached. Please check your connection or retry.",
        sources: ["Service Notice"],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (msgIndex, feedbackType) => {
    const msg = messages[msgIndex];
    if (!msg) return;

    try {
      await submitAssistantFeedback({
        question: messages[msgIndex - 1]?.text || "Farmer Question",
        answer: msg.text,
        feedback: feedbackType
      });
      setActiveFeedbackIndex(msgIndex);
      setFeedbackSuccessMsg(t('assistant.feedback_thanks') || "Thank you for your feedback!");
    } catch (err) {
      console.error('Feedback submission error:', err);
    }
  };

  const currentSampleQuestions = SAMPLE_QUESTIONS[currentLang] || SAMPLE_QUESTIONS.en;

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 border border-emerald-300 text-emerald-800 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Agricultural & Conversational Assistant</span>
          </div>
          <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-extrabold text-stone-900">
            {t('assistant.title')}
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm mt-1">
            {t('assistant.subtitle')}
          </p>
        </div>

        {/* Chat Card */}
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm flex flex-col h-[680px] overflow-hidden">
          
          {/* Top Chat Bar with New Chat / Clear Memory Button */}
          <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-stone-700">Conversational Memory Active</span>
              <span className="text-[10px] text-stone-400">({sessionId.slice(0, 14)}...)</span>
            </div>
            <button
              onClick={handleNewChat}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 font-medium transition-colors"
              title="Start a fresh conversation and reset memory"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Chat Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-emerald-800 text-white rounded-br-none'
                      : 'bg-stone-50 border border-stone-200 text-stone-900 rounded-bl-none'
                  }`}
                >
                  {/* Reused Solution Notice if matched */}
                  {msg.reusedNotice && (
                    <div className="mb-2 p-2 rounded-lg bg-emerald-100/60 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>{msg.reusedNotice}</span>
                    </div>
                  )}

                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Optional Disclaimer if present */}
                  {msg.disclaimer && (
                    <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200/70 text-[11px] text-amber-900 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{msg.disclaimer}</span>
                    </div>
                  )}

                  {/* Sources & Controls for Assistant Message */}
                  {msg.sender === 'assistant' && (
                    <div className="mt-3 pt-2.5 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
                      
                      {/* Evidence Citations */}
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-stone-400" />
                        <span>Sources: {msg.sources?.join(', ') || 'VELTRIX Agricultural Knowledge'}</span>
                      </div>

                      {/* Text-to-Speech Controls */}
                      <div className="flex items-center gap-1.5">
                        {isSpeaking ? (
                          <button
                            onClick={handleStopSpeaking}
                            className="p-1 rounded bg-stone-200 hover:bg-stone-300 text-stone-700"
                            title="Stop speaking"
                          >
                            <Square className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSpeak(msg.text)}
                            className="p-1 rounded hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition-colors"
                            title="Listen to response"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                    </div>
                  )}

                  {/* Feedback question after response */}
                  {msg.sender === 'assistant' && idx > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                      <span>{t('assistant.feedback_prompt') || "Was this answer helpful?"}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleFeedback(idx, 'very_well')}
                          className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
                        >
                          👍 {t('assistant.feedback_yes') || "Yes"}
                        </button>
                        <button
                          onClick={() => handleFeedback(idx, 'not_solved')}
                          className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200"
                        >
                          👎 {t('assistant.feedback_no') || "No"}
                        </button>
                      </div>
                    </div>
                  )}

                  {activeFeedbackIndex === idx && feedbackSuccessMsg && (
                    <div className="mt-1 text-[11px] text-emerald-700 font-medium">
                      ✓ {feedbackSuccessMsg}
                    </div>
                  )}

                </div>

                <span className="text-[10px] text-stone-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 text-xs text-stone-600 bg-stone-50 rounded-xl w-fit border border-stone-200/60">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                <span>VELTRIX AI is thinking and formulating response...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Sample Questions Chips */}
          <div className="px-4 py-2 bg-stone-50/80 border-t border-stone-200/80 overflow-x-auto">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-stone-400 shrink-0">Try Asking:</span>
              {currentSampleQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleAsk(q)}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 border border-stone-200 text-[11px] text-stone-700 hover:text-emerald-800 transition-colors"
                >
                  {q.slice(0, 42)}...
                </button>
              ))}
            </div>
          </div>

          {/* Input Controls & Microphone Bar */}
          <div className="p-4 bg-white border-t border-stone-200">
            <form onSubmit={(e) => { e.preventDefault(); handleAsk(); }} className="flex items-center gap-2">
              
              {/* Microphone Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/30'
                    : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                }`}
                title={isListening ? t('assistant.mic_stop') : t('assistant.mic_start')}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={isListening ? "Listening to your voice..." : t('assistant.input_placeholder') || "Ask any agricultural or general question..."}
                className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!question.trim() || loading}
                className="w-11 h-11 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white flex items-center justify-center shrink-0 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>

            </form>

            {isListening && (
              <div className="text-[11px] text-red-600 font-medium mt-1.5 flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                <span>Microphone active ({LANG_LOCALES[currentLang]}). Speak clearly now...</span>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
