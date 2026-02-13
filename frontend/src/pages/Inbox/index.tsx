import React, { useState, useEffect, useRef } from 'react';
import { Inbox, Send, ArrowLeft, Mail, MessageSquare, Filter, Trash2, TestTube } from 'lucide-react';
import { conversationService } from '../../services/conversationService';
import type { Conversation, Message } from '../../types/modules';
import { format } from 'date-fns';
import ConfirmModal from '../../components/ConfirmModal';

const CHANNEL_COLORS: Record<string, string> = {
    EMAIL: 'bg-blue-100 text-blue-700',
    SMS: 'bg-green-100 text-green-700',
};

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
    EMAIL: <Mail className="h-3 w-3" />,
    SMS: <MessageSquare className="h-3 w-3" />,
};

const InboxPage: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [sendChannel, setSendChannel] = useState<'EMAIL' | 'SMS'>('EMAIL');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [showTestReply, setShowTestReply] = useState(false);
    const [testReplyText, setTestReplyText] = useState('');
    const [testReplyChannel, setTestReplyChannel] = useState<'EMAIL' | 'SMS'>('EMAIL');
    const [sendingTestReply, setSendingTestReply] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        if (selectedId) loadConversation(selectedId);
    }, [selectedId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedConversation?.messages]);

    const loadConversations = async () => {
        try {
            setLoading(true);
            const result = await conversationService.getAll({ limit: 50 });
            setConversations(result.data);
        } catch {
            console.error('Failed to load conversations');
        } finally {
            setLoading(false);
        }
    };

    const loadConversation = async (id: string) => {
        try {
            const convo = await conversationService.getById(id);
            setSelectedConversation(convo);
        } catch {
            console.error('Failed to load conversation');
        }
    };

    const handleSend = async () => {
        if (!newMessage.trim() || !selectedId) return;
        try {
            setSending(true);
            const response = await conversationService.sendMessage(selectedId, { content: newMessage, channel: sendChannel });
            setNewMessage('');
            await loadConversation(selectedId);
            
            // Check if message was actually delivered via email/SMS
            if (response.deliveryError) {
                alert(`⚠️ Message saved to inbox, but NOT delivered to customer!\n\n${response.deliveryError}\n\nPlease configure SendGrid/Twilio in your .env file.`);
            } else if (sendChannel === 'EMAIL' && !response.emailSent) {
                alert('⚠️ Message saved to inbox, but email NOT sent.\n\nCheck backend logs for details.');
            } else if (sendChannel === 'SMS' && !response.smsSent) {
                alert('⚠️ Message saved to inbox, but SMS NOT sent.\n\nCheck backend logs for details.');
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleDelete = (id: string) => {
        setConversationToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!conversationToDelete) return;
        
        try {
            setDeleting(true);
            await conversationService.delete(conversationToDelete);
            
            // Close the conversation if it's the one being deleted
            if (selectedId === conversationToDelete) {
                setSelectedId(null);
                setSelectedConversation(null);
            }
            
            // Reload conversations list
            await loadConversations();
            
            // Close modal
            setDeleteModalOpen(false);
            setConversationToDelete(null);
        } catch (error) {
            console.error('Failed to delete conversation');
            alert('Failed to delete conversation. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    const cancelDelete = () => {
        setDeleteModalOpen(false);
        setConversationToDelete(null);
    };

    const handleTestReply = async () => {
        if (!testReplyText.trim() || !selectedId) return;
        try {
            setSendingTestReply(true);
            await conversationService.recordInbound(selectedId, { 
                content: testReplyText, 
                channel: testReplyChannel 
            });
            setTestReplyText('');
            setShowTestReply(false);
            await loadConversation(selectedId);
        } catch (error) {
            console.error('Failed to record test reply');
            alert('Failed to record test reply. Please try again.');
        } finally {
            setSendingTestReply(false);
        }
    };

    // Determine if a conversation has unanswered messages
    const isUnanswered = (convo: Conversation) => {
        const lastMsg = convo.messages?.[0];
        return lastMsg && lastMsg.direction === 'INBOUND';
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-white shadow-card rounded-xl border border-gray-100 overflow-hidden">
            {/* Conversation List */}
            <div className={`w-80 border-r border-gray-200 flex flex-col ${selectedId ? 'hidden md:flex' : 'flex'} flex-shrink-0 bg-gray-50`}>
                <div className="p-5 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-50 rounded-lg">
                            <Inbox className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Inbox</h2>
                            <p className="text-xs text-gray-500">Customer messages</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm px-4">
                            No conversations yet. They'll appear here when contacts message you.
                        </div>
                    ) : (
                        conversations.map(convo => {
                            const lastMsg = convo.messages?.[0];
                            const channel = lastMsg?.channel;
                            const unanswered = isUnanswered(convo);

                            return (
                                <button
                                    key={convo.id}
                                    onClick={() => setSelectedId(convo.id)}
                                    className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                        selectedId === convo.id ? 'bg-primary-50 border-l-2 border-l-primary-600' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-shrink-0">
                                            <div className="h-9 w-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-medium">
                                                {convo.contact?.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            {unanswered && (
                                                <div className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-red-500 rounded-full border-2 border-white" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className={`text-sm truncate ${unanswered ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                    {convo.contact?.name || 'Unknown'}
                                                </p>
                                                {channel && (
                                                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${CHANNEL_COLORS[channel] || 'bg-gray-100 text-gray-600'}`}>
                                                        {CHANNEL_ICONS[channel]}
                                                        {channel}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 truncate mt-0.5">
                                                {lastMsg?.direction === 'OUTBOUND' && <span className="text-gray-400">You: </span>}
                                                {lastMsg?.content || 'No messages yet'}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Message Thread */}
            <div className={`flex-1 flex flex-col ${!selectedId ? 'hidden md:flex' : 'flex'}`}>
                {!selectedConversation ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                            <Mail className="h-12 w-12 mx-auto mb-3" />
                            <p className="text-sm">Select a conversation to view messages</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                            <button onClick={() => { setSelectedId(null); setSelectedConversation(null); }} className="md:hidden text-gray-500 hover:text-gray-700">
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-medium">
                                {selectedConversation.contact?.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{selectedConversation.contact?.name}</p>
                                <p className="text-xs text-gray-500">
                                    {selectedConversation.contact?.email}
                                    {selectedConversation.contact?.phone && ` · ${selectedConversation.contact.phone}`}
                                </p>
                            </div>
                            <button 
                                onClick={() => setShowTestReply(true)}
                                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                title="Simulate customer reply (for testing)"
                            >
                                <TestTube className="h-4 w-4" />
                            </button>
                            <button 
                                onClick={() => handleDelete(selectedConversation.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete conversation"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {selectedConversation.messages?.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-sm">No messages in this conversation yet. Send the first one below.</div>
                            ) : (
                                selectedConversation.messages?.map((msg: Message) => (
                                    <div key={msg.id} className={`flex ${msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${msg.direction === 'OUTBOUND'
                                            ? 'bg-primary-600 text-white rounded-br-md'
                                            : 'bg-gray-100 text-gray-900 rounded-bl-md'
                                            }`}>
                                            <p>{msg.content}</p>
                                            <div className={`flex items-center gap-1.5 mt-1 text-xs ${msg.direction === 'OUTBOUND' ? 'text-primary-200' : 'text-gray-400'}`}>
                                                {msg.sender?.name && <span className="font-medium">{msg.sender.name}</span>}
                                                {msg.sender?.name && <span>·</span>}
                                                <span className={`inline-flex items-center gap-0.5 ${msg.direction === 'OUTBOUND' ? 'text-primary-200' : 'text-gray-400'}`}>
                                                    {msg.channel === 'SMS' ? <MessageSquare className="h-2.5 w-2.5" /> : <Mail className="h-2.5 w-2.5" />}
                                                    {msg.channel}
                                                </span>
                                                <span>·</span>
                                                {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input with channel selector */}
                        <div className="p-4 border-t border-gray-200">
                            <div className="flex gap-2">
                                {/* Channel selector */}
                                <div className="flex items-center">
                                    <button
                                        onClick={() => setSendChannel(sendChannel === 'EMAIL' ? 'SMS' : 'EMAIL')}
                                        className={`px-3 py-2.5 border rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                                            sendChannel === 'EMAIL'
                                                ? 'border-blue-300 bg-blue-50 text-blue-700'
                                                : 'border-green-300 bg-green-50 text-green-700'
                                        }`}
                                        title={`Sending via ${sendChannel}. Click to switch.`}
                                    >
                                        {sendChannel === 'EMAIL' ? <Mail className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
                                        {sendChannel}
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={`Type a message (${sendChannel})...`}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={sending || !newMessage.trim()}
                                    className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Test Reply Modal (for development/testing) */}
            {showTestReply && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={() => setShowTestReply(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-scaleIn" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TestTube className="h-5 w-5 text-primary-600" />
                                    <h3 className="text-lg font-semibold text-gray-900">Simulate Customer Reply</h3>
                                </div>
                                <button onClick={() => setShowTestReply(false)} className="text-gray-400 hover:text-gray-600">
                                    <ArrowLeft className="h-5 w-5" />
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">For testing: Add a message as if the customer replied</p>
                        </div>
                        
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="label">Channel</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setTestReplyChannel('EMAIL')}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                                            testReplyChannel === 'EMAIL'
                                                ? 'border-blue-300 bg-blue-50 text-blue-700'
                                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Mail className="h-4 w-4" />
                                        Email
                                    </button>
                                    <button
                                        onClick={() => setTestReplyChannel('SMS')}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                                            testReplyChannel === 'SMS'
                                                ? 'border-green-300 bg-green-50 text-green-700'
                                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                        SMS
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="label">Message</label>
                                <textarea
                                    value={testReplyText}
                                    onChange={(e) => setTestReplyText(e.target.value)}
                                    placeholder="Type customer's reply message..."
                                    className="input min-h-[100px] resize-none"
                                    autoFocus
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    onClick={() => setShowTestReply(false)}
                                    className="btn-secondary"
                                    disabled={sendingTestReply}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleTestReply}
                                    disabled={!testReplyText.trim() || sendingTestReply}
                                    className="btn-primary"
                                >
                                    {sendingTestReply ? 'Adding...' : 'Add Reply'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
                title="Delete Conversation"
                message="Are you sure you want to delete this conversation? All messages will be permanently removed. This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                loading={deleting}
            />
        </div>
    );
};

export default InboxPage;
