import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../components/icons';
import { Button } from '../components/ui';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { queryAssistant } from '../services/apiService';

// Define TypeScript types for our conversation messages
type Message = {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  retrievedDocs?: string[];
};

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(() => {
      // This function runs only on the initial render
      try {
          const savedMessages = sessionStorage.getItem('chatMessages');
          if (savedMessages) {
              return JSON.parse(savedMessages);
          }
      } catch (error) {
          console.error("Could not parse saved chat messages:", error);
      }
      // If nothing is saved, return the default initial message
      return [{ id: 1, role: 'assistant', content: "Hello! I'm your AI feedback assistant. Ask a question about the initial reviews, or upload a document to expand my knowledge base." }];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // --- NEW STATE for managing the search filter ---
  const [searchInDocsOnly, setSearchInDocsOnly] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Effect to auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // This effect runs every time the 'messages' array changes
    try {
        sessionStorage.setItem('chatMessages', JSON.stringify(messages));
    } catch (error) {
        console.error("Failed to save chat messages:", error);
    }
}, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // --- NEW: Determine the filter and pass it to the API call ---
      const source_filter = searchInDocsOnly ? "report" : "all";
      const response = await queryAssistant(input, source_filter);
      
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.answer,
        retrievedDocs: response.retrieved_documents,
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "Sorry, I encountered an error. Please ensure the backend is running and check the console for details."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-full"
    >
      <div>
        <h1 className="text-3xl font-bold text-white">AI Assistant</h1>
        <p className="text-gray-400 mt-1">Your conversational interface for feedback analysis.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto mt-6 pr-4 space-y-4" ref={messagesEndRef}>
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={cn( 'flex items-start gap-3 w-full', message.role === 'user' ? 'justify-end' : 'justify-start' )}
            >
              {message.role === 'assistant' && <Icons.bot className="h-8 w-8 text-blue-500 flex-shrink-0 mt-1" />}
              <div className={cn( 'max-w-xl p-4 rounded-xl', message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300' )}>
                <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                </div>
                {message.retrievedDocs && message.retrievedDocs.length > 0 && (
                  <div className="mt-4 border-t border-gray-700 pt-3">
                    <h4 className="font-semibold text-xs text-gray-400 mb-2">Retrieved Context:</h4>
                    <div className="space-y-2">
                      {message.retrievedDocs.map((doc, index) => (
                        <p key={index} className="text-xs text-gray-500 bg-gray-900/50 p-2 rounded-md border border-gray-700/50 truncate" title={doc}>
                          "{doc}"
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {message.role === 'user' && <Icons.user className="h-8 w-8 text-gray-400 flex-shrink-0 mt-1" />}
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
            <div className="flex items-start gap-3 justify-start">
                <Icons.bot className="h-8 w-8 text-blue-500 flex-shrink-0 mt-1" />
                <div className="bg-gray-800 p-4 rounded-xl">
                    <Icons.loader className="h-5 w-5 animate-spin" />
                </div>
            </div>
        )}
      </div>

      <div className="mt-4 space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleSuggestionClick('What are the most common complaints about comfort?')}>Comfort complaints?</Button>
          <Button variant="outline" size="sm" onClick={() => handleSuggestionClick('Summarize feedback related to sizing issues.')}>Sizing issues?</Button>
          <Button variant="outline" size="sm" onClick={() => handleSuggestionClick('Find reviews that mention "material" or "fabric".')}>Fabric feedback?</Button>
      </div>

      {/* --- NEW: Checkbox for filtering search --- */}
      <div className="mt-4 flex items-center justify-end">
          <label htmlFor="search-docs" className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
              <input
                  id="search-docs"
                  type="checkbox"
                  checked={searchInDocsOnly}
                  onChange={(e) => setSearchInDocsOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
              />
              Search in uploaded documents only
          </label>
      </div>

      <form onSubmit={handleSubmit} className="mt-2 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about feedback trends, specific issues, or suggest a new report..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          <Icons.send className="h-5 w-5" />
        </Button>
      </form>
    </motion.div>
  );
}