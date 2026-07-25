'use client';

import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp } from 'lucide-react';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (input.trim() && !disabled) {
            onSend(input.trim());
            setInput('');
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="w-full">
            {/* Premium Input Box */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl relative min-h-[112px]">
                <div className="flex p-4">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your question here ..."
                        className="flex-1 bg-transparent border-none text-white placeholder:text-white/40 resize-none min-h-[64px] focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-base"
                        rows={2}
                        disabled={disabled}
                    />
                </div>

                <div className="flex gap-2 items-center absolute right-3 bottom-3">
                    <div className="text-xs text-white/40">
                        {input.length}/4000
                    </div>
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || disabled}
                        size="icon"
                        className="rounded-full w-8 h-8 bg-white/10 hover:bg-white/20 text-white border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowUp className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
