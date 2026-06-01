import { useState, useRef, useEffect } from 'react';
import { getChatbotResponse, SUGGESTIONS } from '../../services/chatbotService';
import './ChatWidget.css';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Ola! Sou o assistente do EasyEmpresa. Como posso ajudar?' }
    ]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typing]);

    const sendMessage = (text) => {
        if (!text.trim()) return;
        const userMsg = text.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setTyping(true);

        setTimeout(() => {
            const response = getChatbotResponse(userMsg);
            setMessages(prev => [...prev, { role: 'bot', text: response }]);
            setTyping(false);
        }, 600);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage(input);
    };

    return (
        <div className="chat-widget">
            {isOpen && (
                <div className="chat-widget-panel">
                    <div className="chat-widget-header">
                        <div className="chat-widget-header-info">
                            <div className="chat-widget-avatar">EE</div>
                            <div>
                                <h4>Assistente EasyEmpresa</h4>
                                <span className="chat-widget-status">Online</span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="chat-widget-close">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    </div>
                    <div className="chat-widget-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`chat-msg chat-msg-${msg.role}`}>
                                <div className="chat-msg-bubble">
                                    {msg.text.split('\n').map((line, j) => <p key={j}>{line}</p>)}
                                </div>
                            </div>
                        ))}
                        {typing && (
                            <div className="chat-msg chat-msg-bot">
                                <div className="chat-msg-bubble chat-typing">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    {messages.length <= 2 && (
                        <div className="chat-suggestions">
                            {SUGGESTIONS.map((s, i) => (
                                <button key={i} className="chat-suggestion-btn" onClick={() => sendMessage(s)}>{s}</button>
                            ))}
                        </div>
                    )}
                    <form className="chat-widget-input" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Digite sua pergunta..."
                            disabled={typing}
                        />
                        <button type="submit" disabled={typing || !input.trim()}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        </button>
                    </form>
                </div>
            )}
            <button
                className={`chat-widget-fab ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Abrir assistente"
            >
                {isOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                )}
            </button>
        </div>
    );
}
