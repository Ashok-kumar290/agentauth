'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

interface OrderResult {
    order_id: string;
    total_price: number;
    platform: string;
    estimated_ready: string;
}

export default function VoiceAgent() {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Hi! I'm your AI purchase assistant. Tap the mic and tell me what you'd like to buy.",
            timestamp: new Date(),
        },
    ]);
    const [currentOrder, setCurrentOrder] = useState<OrderResult | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const addMessage = useCallback((role: 'user' | 'assistant' | 'system', content: string) => {
        setMessages((prev) => [...prev, { role, content, timestamp: new Date() }]);
    }, []);

    const startListening = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                chunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                stream.getTracks().forEach((track) => track.stop());
                await processAudio(audioBlob);
            };

            mediaRecorder.start();
            setIsListening(true);
        } catch (error) {
            console.error('Failed to start recording:', error);
            addMessage('system', 'Failed to access microphone. Please check permissions.');
        }
    }, [addMessage]);

    const stopListening = useCallback(() => {
        if (mediaRecorderRef.current && isListening) {
            mediaRecorderRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    const processAudio = async (audioBlob: Blob) => {
        setIsProcessing(true);
        addMessage('user', '🎤 [Voice command...]');

        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');
            formData.append('user_id', 'demo_user');

            const response = await fetch('/api/v1/voice', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setCurrentOrder({
                    order_id: data.order_id,
                    total_price: data.total_price,
                    platform: data.platform,
                    estimated_ready: data.estimated_ready,
                });
                addMessage('assistant', data.message);
            } else {
                addMessage('assistant', data.message || 'Sorry, I could not process that request.');
            }
        } catch (error) {
            console.error('Error processing audio:', error);
            addMessage('assistant', 'Sorry, there was an error processing your request. Try the text input instead.');
        } finally {
            setIsProcessing(false);
        }
    };

    const sendTextCommand = async (text: string) => {
        if (!text.trim()) return;

        addMessage('user', text);
        setIsProcessing(true);

        try {
            const response = await fetch('/api/v1/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, user_id: 'demo_user' }),
            });

            const data = await response.json();

            if (data.success && data.order_id) {
                setCurrentOrder({
                    order_id: data.order_id,
                    total_price: data.total_price,
                    platform: data.platform,
                    estimated_ready: data.estimated_ready,
                });
            }
            addMessage('assistant', data.message);
        } catch (error) {
            console.error('Error sending command:', error);
            addMessage('assistant', 'Sorry, there was an error. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const [textInput, setTextInput] = useState('');

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="glass border-b border-white/10 p-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <span className="text-xl">🛒</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">AgentBuy</h1>
                            <p className="text-xs text-gray-400">Voice AI Purchase Agent</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-sm text-gray-400">Online</span>
                    </div>
                </div>
            </header>

            {/* Messages */}
            <main className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full">
                <div className="space-y-4">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-primary to-secondary text-white'
                                        : msg.role === 'system'
                                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                            : 'glass text-white'
                                    }`}
                            >
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                            </div>
                        </div>
                    ))}

                    {/* Order Card */}
                    {currentOrder && (
                        <div className="glass rounded-2xl p-4 border border-green-500/30 bg-green-500/10">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-green-400 text-lg">✓</span>
                                <span className="font-semibold text-green-400">Order Confirmed</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-gray-400">Platform</p>
                                    <p className="font-medium capitalize">{currentOrder.platform}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Total</p>
                                    <p className="font-medium">${currentOrder.total_price.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Order ID</p>
                                    <p className="font-mono text-xs">{currentOrder.order_id}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Ready by</p>
                                    <p className="font-medium">
                                        {new Date(currentOrder.estimated_ready).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {isProcessing && (
                        <div className="flex justify-start">
                            <div className="glass rounded-2xl px-4 py-3 flex items-center gap-2">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.1s]"></span>
                                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                </div>
                                <span className="text-sm text-gray-400">Processing...</span>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Input Area */}
            <footer className="glass border-t border-white/10 p-4">
                <div className="max-w-4xl mx-auto">
                    {/* Voice Button */}
                    <div className="flex items-center justify-center mb-4">
                        <button
                            onClick={isListening ? stopListening : startListening}
                            disabled={isProcessing}
                            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${isListening
                                    ? 'bg-red-500 scale-110'
                                    : 'bg-gradient-to-br from-primary to-secondary hover:scale-105'
                                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isListening && (
                                <>
                                    <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20"></span>
                                    <span className="absolute inset-0 rounded-full bg-red-500 animate-pulse opacity-40"></span>
                                </>
                            )}
                            <span className="text-3xl z-10">{isListening ? '⏹' : '🎤'}</span>
                        </button>
                    </div>

                    {/* Voice indicator */}
                    {isListening && (
                        <div className="flex items-center justify-center gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1 bg-red-400 rounded-full voice-wave"
                                    style={{ animationDelay: `${i * 0.1}s` }}
                                ></div>
                            ))}
                            <span className="ml-2 text-sm text-red-400">Listening...</span>
                        </div>
                    )}

                    {/* Text Input */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            sendTextCommand(textInput);
                            setTextInput('');
                        }}
                        className="flex gap-2"
                    >
                        <input
                            type="text"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="Or type your request..."
                            disabled={isProcessing}
                            className="flex-1 bg-surface rounded-xl px-4 py-3 text-sm border border-white/10 focus:outline-none focus:border-primary transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={isProcessing || !textInput.trim()}
                            className="px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            Send
                        </button>
                    </form>

                    <p className="text-center text-xs text-gray-500 mt-3">
                        Try: "Buy me a grande latte from Starbucks"
                    </p>
                </div>
            </footer>
        </div>
    );
}
