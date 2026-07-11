import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Send, Paperclip, ArrowLeft, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { formatRelative } from '../../utils/helpers';

export default function MessagesPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const [selectedConv, setSelectedConv] = useState(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef();

  const { data: convData } = useQuery({ queryKey: ['conversations'], queryFn: async () => { const { data } = await api.get('/conversations'); return data; } });

  const { data: msgData } = useQuery({
    queryKey: ['messages', selectedConv],
    queryFn: async () => { if (!selectedConv) return { messages: [] }; const { data } = await api.get(`/conversations/${selectedConv}/messages`); return data; },
    enabled: !!selectedConv
  });

  const sendMutation = useMutation({
    mutationFn: async () => { if (!message.trim() || !selectedConv) return; const { data } = await api.post(`/conversations/${selectedConv}/messages`, { content: message, contentType: 'text' }); return data; },
    onSuccess: (data) => { setMessage(''); queryClient.invalidateQueries('messages'); if (socket && selectedConv) socket.emit('send_message', { conversationId: selectedConv, message: data.message }); }
  });

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgData?.messages]);

  useEffect(() => {
    if (!socket || !selectedConv) return;
    socket.emit('join_conversation', selectedConv);
    const handler = () => queryClient.invalidateQueries('messages');
    socket.on('new_message', handler);
    return () => socket.off('new_message', handler);
  }, [socket, selectedConv, queryClient]);

  const conversations = convData?.conversations || [];
  const messages = msgData?.messages || [];

  return (
    <div className="h-[calc(100vh-3rem)] flex rounded-2xl overflow-hidden border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card">
      <div className={`w-80 border-r border-gray-100 dark:border-dark-border flex flex-col ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100 dark:border-dark-border">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Messagerie</h2>
          <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input placeholder="Rechercher..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm outline-none" /></div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(c => {
            const other = c.participants?.find(p => p.userId?._id !== user?._id);
            const isSelected = selectedConv === c._id;
            return (
              <button key={c._id} onClick={() => setSelectedConv(c._id)} className={`w-full p-3 flex items-center gap-3 text-left hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors ${isSelected ? 'bg-medcare-green/5 border-r-2 border-medcare-green' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-medcare-green/10 flex items-center justify-center text-medcare-green font-semibold text-sm flex-shrink-0">{other?.userId?.name?.[0] || '?'}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{other?.userId?.name || 'Conversation'}</p>
                  <p className="text-xs text-gray-500 truncate">{c.lastMessage?.content || 'Aucun message'}</p>
                </div>
              </button>
            );
          })}
          {conversations.length === 0 && <p className="p-6 text-center text-sm text-gray-400">Aucune conversation</p>}
        </div>
      </div>

      <div className={`flex-1 flex flex-col ${!selectedConv ? 'hidden md:flex' : 'flex'}`}>
        {!selectedConv ? (
          <div className="flex-1 flex items-center justify-center"><div className="text-center"><MessageCircle size={48} className="mx-auto text-gray-300 mb-3" /><p className="text-sm text-gray-400">Sélectionnez une conversation</p></div></div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-100 dark:border-dark-border flex items-center gap-3">
              <button onClick={() => setSelectedConv(null)} className="md:hidden p-1 rounded-lg hover:bg-gray-100"><ArrowLeft size={18} /></button>
              <div className="w-9 h-9 rounded-full bg-medcare-green/10 flex items-center justify-center text-medcare-green font-semibold text-sm">{conversations.find(c => c._id === selectedConv)?.participants?.find(p => p.userId?._id !== user?._id)?.userId?.name?.[0] || '?'}</div>
              <div><p className="text-sm font-medium text-gray-900 dark:text-white">{conversations.find(c => c._id === selectedConv)?.participants?.find(p => p.userId?._id !== user?._id)?.userId?.name || ''}</p></div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => {
                const isMine = msg.senderId?._id === user?._id;
                return (
                  <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl ${isMine ? 'bg-medcare-green text-white rounded-br-md' : 'bg-gray-100 dark:bg-dark-bg text-gray-900 dark:text-white rounded-bl-md'}`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMine ? 'text-white/60' : 'text-gray-400'}`}>{formatRelative(msg.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-dark-border">
              <div className="flex items-center gap-2">
                <input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMutation.mutate()} placeholder="Écrire un message..." className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm outline-none focus:ring-2 focus:ring-medcare-green" />
                <button onClick={() => sendMutation.mutate()} disabled={!message.trim() || sendMutation.isPending} className="p-2.5 rounded-xl bg-medcare-green text-white hover:bg-medcare-green/90 disabled:opacity-50"><Send size={18} /></button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
