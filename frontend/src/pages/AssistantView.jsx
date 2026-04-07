import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Sparkles, Bot, User, RefreshCw, MessageSquare } from 'lucide-react';
import { fetchTasks, fetchHabits, fetchGoals, askAI } from '../services/api';

const AssistantView = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('assistant_messages');
    return saved ? JSON.parse(saved) : [
      {
        role: 'assistant',
        text: "Hey 👋 I'm your LifeOS Friend. How can I help you today?"
      }
    ];
  });
  const [typing, setTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('assistant_messages', JSON.stringify(messages));
  }, [messages]);

  const clearChat = () => {
    const initial = [{ role: 'assistant', text: "Hey! Let's start fresh. How can I help?" }];
    setMessages(initial);
    setSuggestions([]);
    localStorage.removeItem('assistant_messages');
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing, suggestions]);

  // 🔊 Voice output
  const speak = (text) => {
    if (!text) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-IN";
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  };

  useEffect(() => {
    const userName = localStorage.getItem('userName') || 'Friend';
    const lastGreeted = sessionStorage.getItem('last_greeted');
    
    if (!lastGreeted) {
      const g = `Hey ${userName.split(' ')[0]}! Nice to see you. How can I help you optimize your day today?`;
      setTimeout(() => speak(g), 1000);
      sessionStorage.setItem('last_greeted', 'true');
    }
  }, []);

  const startListening = () => {
    const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    rec.lang = "en-IN";
    setIsListening(true);
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setIsListening(false);
      sendMessage(text);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    rec.start();
  };

  const sendMessage = async (msg) => {
    const text = (msg || input).trim();
    if (!text) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setSuggestions([]);
    setTyping(true);

    try {
      const token = localStorage.getItem('token');
      const h = { Authorization: `Bearer ${token}` };
      
      const [tasks, hb, gls] = await Promise.all([
        fetchTasks(),
        fetchHabits(),
        fetchGoals()
      ]);

      const appContext = {
        pending_tasks: Array.isArray(tasks) ? tasks.filter(t => !t.completed).map(t => t.title) : [],
        habits: Array.isArray(hb) ? hb.map(h => `${h.title} (${h.streak} streak)`) : [],
        goals: Array.isArray(gls) ? gls.map(g => `${g.title} (${g.progress}% done)`) : []
      };

      const data = await askAI(text, appContext);
      setTyping(false);

      const reply = data.answer || "Hmm... try again";
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: reply,
        followUp: data.followUp
      }]);

      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
      }

      speak(data.voiceText || reply);

    } catch (err) {
      console.error(err);
      setTyping(false);
      setMessages(prev => [...prev, { role: 'assistant', text: "Oops, thoda issue aa gaya. Phir se try karein?" }]);
    }
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'transparent',
      color: 'white',
      overflow: 'hidden',
      position: 'relative',
      borderRadius: window.innerWidth <= 768 ? '0' : '24px',
      border: window.innerWidth <= 768 ? 'none' : '1px solid rgba(255,255,255,0.05)',
      boxShadow: window.innerWidth <= 768 ? 'none' : '0 20px 40px rgba(0,0,0,0.4)',
      marginBottom: window.innerWidth <= 768 ? '-16px' : '0',
    }}>

      {/* BACKGROUND EFFECTS */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '50%',
        height: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '50%',
        height: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* HEADER */}
      <div style={{
        padding: '1.2rem 1.8rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(16px)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', 
            padding: '10px', 
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
          }}>
            <Bot size={22} color="white" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em' }}>LifeOS Friend</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <div style={{ 
                width: '8px', height: '8px', 
                background: '#22c55e', 
                borderRadius: '50%',
                boxShadow: '0 0 8px #22c55e'
              }}></div>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Online</span>
            </div>
          </div>
        </div>
        <button onClick={clearChat} title="Clear Chat" style={{
          background: 'transparent',
          border: 'none',
          color: 'rgba(255,255,255,0.4)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
          borderRadius: '50%'
        }}
        onMouseOver={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
        onMouseOut={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* CHAT AREA */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        zIndex: 1
      }}>
        {messages.length === 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'rgba(255,255,255,0.3)',
            gap: '10px'
          }}>
            <MessageSquare size={48} opacity={0.5} />
            <p>Ready to assist you.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            gap: '6px',
            animation: 'slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            transformOrigin: msg.role === 'user' ? 'bottom right' : 'bottom left'
          }}>
            <div style={{
              display: 'flex',
              gap: '10px',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-end',
              maxWidth: '85%'
            }}>
              {/* Optional Avatar for Assistant */}
              {msg.role === 'assistant' && i === messages.length - 1 && (
                 <div style={{
                   width: '28px', height: '28px',
                   borderRadius: '50%',
                   background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                   display: 'flex', alignItems: 'center', justifyContent: 'center',
                   flexShrink: 0,
                   boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)'
                 }}>
                   <Bot size={14} color="white" />
                 </div>
              )}

              <div style={{
                padding: '14px 18px',
                borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
                border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.05)',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                color: 'white',
                boxShadow: msg.role === 'user' 
                  ? '0 6px 20px rgba(99, 102, 241, 0.3)' 
                  : '0 4px 12px rgba(0,0,0,0.1)',
                wordBreak: 'break-word',
                marginLeft: msg.role === 'assistant' && i !== messages.length - 1 ? '38px' : '0'
              }}>
                {msg.text}
                {msg.followUp && (
                  <div style={{ 
                    marginTop: '10px', 
                    paddingTop: '10px', 
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    fontStyle: 'italic',
                    color: msg.role === 'user' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.6)',
                    fontSize: '0.85rem'
                  }}>
                    {msg.followUp}
                  </div>
                )}
              </div>
            </div>
            <span style={{ 
              fontSize: '0.65rem', 
              color: 'rgba(255,255,255,0.3)', 
              margin: msg.role === 'user' ? '0 5px 0 0' : (i === messages.length - 1 ? '0 0 0 38px' : '0 5px')
            }}>
              {msg.role === 'user' ? 'You' : 'LifeOS Friend'}
            </span>
          </div>
        ))}

        {typing && (
          <div style={{ 
            display: 'flex', alignItems: 'flex-end', gap: '10px', 
            color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem',
            animation: 'fadeIn 0.3s ease-out'
          }}>
             <div style={{
               width: '28px', height: '28px',
               borderRadius: '50%',
               background: 'rgba(255,255,255,0.1)',
               display: 'flex', alignItems: 'center', justifyContent: 'center',
               flexShrink: 0
             }}>
               <Bot size={14} color="rgba(255,255,255,0.6)" />
             </div>
             <div style={{
               padding: '12px 18px',
               borderRadius: '20px 20px 20px 4px',
               background: 'rgba(255,255,255,0.04)',
               border: '1px solid rgba(255,255,255,0.05)',
               display: 'flex',
               gap: '4px',
               alignItems: 'center'
             }}>
                <span className="dot-typing" style={{animationDelay: '0s'}}></span>
                <span className="dot-typing" style={{animationDelay: '0.2s'}}></span>
                <span className="dot-typing" style={{animationDelay: '0.4s'}}></span>
             </div>
          </div>
        )}

        {/* SUGGESTION PILLS */}
        {!typing && suggestions.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: '5px',
            marginLeft: '38px',
            animation: 'slideUpFade 0.4s ease-out'
          }}>
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                style={{
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  color: '#c7d2fe',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Sparkles size={12} />
                {s}
              </button>
            ))}
          </div>
        )}
        <div ref={bottomRef} style={{height: '1px'}} />
      </div>

      {/* INPUT AREA */}
      <div style={{
        padding: '1.2rem',
        background: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        zIndex: 10
      }}>
        <button 
          onClick={startListening} 
          title="Voice Input"
          style={{
            background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${isListening ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255,255,255,0.1)'}`,
            padding: '12px',
            borderRadius: '16px',
            cursor: 'pointer',
            color: isListening ? '#ef4444' : 'rgba(255,255,255,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            animation: isListening ? 'pulse 1.5s infinite' : 'none'
          }}
          onMouseOver={(e) => { if(!isListening) e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
          onMouseOut={(e) => { if(!isListening) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
        >
          <Mic size={20} />
        </button>

        <div style={{ flex: 1, position: 'relative' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              outline: 'none',
              background: 'rgba(0,0,0,0.2)',
              color: 'white',
              fontSize: '0.95rem',
              transition: 'all 0.3s ease',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
            }}
            onFocus={(e) => e.target.style.borderColor = 'rgba(99, 102, 241, 0.5)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
        </div>

        <button 
          onClick={() => sendMessage()} 
          disabled={!input.trim()}
          style={{
            background: input.trim() ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.05)',
            border: 'none',
            padding: '14px',
            borderRadius: '16px',
            cursor: input.trim() ? 'pointer' : 'default',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: input.trim() ? '0 4px 15px rgba(99, 102, 241, 0.4)' : 'none',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            opacity: input.trim() ? 1 : 0.5,
            transform: input.trim() ? 'scale(1)' : 'scale(0.95)'
          }}
          onMouseOver={(e) => { if(input.trim()) e.currentTarget.style.transform = 'scale(1.05)' }}
          onMouseOut={(e) => { if(input.trim()) e.currentTarget.style.transform = 'scale(1)' }}
        >
          <Send size={20} style={{ transform: input.trim() ? 'translateX(2px) translateY(-2px)' : 'none', transition: 'all 0.3s' }} />
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(15px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .dot-typing {
          width: 5px;
          height: 5px;
          background: rgba(255,255,255,0.6);
          border-radius: 50%;
          animation: dotBlink 1.4s infinite both;
        }
        @keyframes dotBlink {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}} />
    </div>
  );
};

export default AssistantView;