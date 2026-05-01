import React, { useState, useEffect, useRef } from 'react';
import { Inbox, Send, ArrowLeft, Mail, MessageSquare, Trash2, TestTube, Sparkles, BrainCircuit } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { conversationService } from '../../services/conversationService';
import { aiService } from '../../services/aiService';
import type { Conversation, Message } from '../../types/modules';
import { format } from 'date-fns';
import ConfirmModal from '../../components/ConfirmModal';
import Badge from '../../components/Badge';

const CHANNEL_COLORS: Record<string, string> = {
    EMAIL: 'bg-blue-900/30 text-blue-400',
    SMS: 'bg-emerald-900/30 text-emerald-400',
};

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
    EMAIL: <Mail className="h-3 w-3" />,
    SMS: <MessageSquare className="h-3 w-3" />,
};

const SENTIMENT_COLORS: Record<string, 'green' | 'gray' | 'red'> = {
    Positive: 'green',
    Neutral: 'gray',
    Negative: 'red',
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
    const [generatingReply, setGeneratingReply] = useState(false);
    const { socket } = useSocket();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // AI Analysis State
    const [aiAnalysis, setAiAnalysis] = useState<{ intent: string; sentiment: string; score: number; tags: string[] } | null>(null);
    const [draftReply, setDraftReply] = useState<string | null>(null);

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('message:received', (data: any) => {
            // Refresh conversation list to show new preview
            loadConversations();

            // If this message belongs to the currently selected conversation
            if (selectedId && data.conversationId === selectedId) {
                // Refresh the messages
                loadConversation(selectedId).then(() => {
                    // If the event contained AI analysis, display it
                    if (data.aiAnalysis) {
                        setAiAnalysis(data.aiAnalysis);
                    }
                    if (data.draftReply) {
                        setDraftReply(data.draftReply);
                    }
                });
            }
        });

        return () => {
            socket.off('message:received');
        };
    }, [socket, selectedId]);

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
            setAiAnalysis(null);
            setDraftReply(null); // Clear draft when switching
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
            const response = await conversationService.recordInbound(selectedId, {
                content: testReplyText,
                channel: testReplyChannel
            });

            setTestReplyText('');
            setShowTestReply(false);

            await loadConversation(selectedId);

            if (response.aiAnalysis) setAiAnalysis(response.aiAnalysis);
            if (response.draftReply) setDraftReply(response.draftReply); // Set draft from response

        } catch (error) {
            console.error('Failed to record test reply');
            alert('Failed to record test reply. Please try again.');
        } finally {
            setSendingTestReply(false);
        }
    };

    const handleSmartReply = async () => {
        if (!selectedConversation || !selectedConversation.messages) return;

        try {
            setGeneratingReply(true);

            // Format context for AI
            const context = selectedConversation.messages
                .slice(-10) // Take last 10 messages for context
                .map(msg => `${msg.direction === 'OUTBOUND' ? 'Agent' : 'Customer'}: ${msg.content}`)
                .join('\n');

            const response = await aiService.generateReply(context);
            if (response.reply) {
                setNewMessage(response.reply);
            }
        } catch (error) {
            console.error('Failed to generate smart reply:', error);
            alert('Failed to generate smart reply. Please try again.');
        } finally {
            setGeneratingReply(false);
        }
    };

    const useDraftReply = () => {
        if (draftReply) {
            setNewMessage(draftReply);
            setDraftReply(null); // Clear draft after using
        }
    };

    // Determine if a conversation has unanswered messages
    const isUnanswered = (convo: Conversation) => {
        const lastMsg = convo.messages?.[0];
        return lastMsg && lastMsg.direction === 'INBOUND';
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-surface-1 rounded-xl border border-white/[0.24] overflow-hidden">
            {/* Conversation List */}
            <div className={`w-full md:w-80 border-r border-white/[0.24] flex flex-col ${selectedId ? 'hidden md:flex' : 'flex'} flex-shrink-0 bg-surface-0`}>
                <div className="p-5 border-b border-white/[0.24] bg-surface-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-900/30 rounded-lg">
                            <Inbox className="h-5 w-5 text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-text-primary font-display">Inbox</h2>
                            <p className="text-xs text-text-muted">Customer messages</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="text-center py-8 text-text-muted text-sm px-4">
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
                                    className={`w-full p-4 text-left border-b border-white/[0.16] hover:bg-surface-2/50 transition-colors ${selectedId === convo.id ? 'bg-amber-500/5 border-l-2 border-l-amber-500' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-shrink-0">
                                            <div className="h-9 w-9 rounded-full bg-surface-3 text-amber-400 flex items-center justify-center text-sm font-medium font-display">
                                                {convo.contact?.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            {unanswered && (
                                                <div className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-amber-500 rounded-full border-2 border-surface-0" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className={`text-sm truncate ${unanswered ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary'}`}>
                                                    {convo.contact?.name || 'Unknown'}
                                                </p>
                                                {channel && (
                                                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${CHANNEL_COLORS[channel] || 'bg-surface-3 text-text-muted'}`}>
                                                        {CHANNEL_ICONS[channel]}
                                                        {channel}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-text-muted truncate mt-0.5">
                                                {lastMsg?.direction === 'OUTBOUND' && <span className="text-text-muted/50">You: </span>}
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
                    <div className="flex-1 flex items-center justify-center text-text-muted">
                        <div className="text-center">
                            <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Select a conversation to view messages</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-white/[0.24] bg-surface-1">
                            <div className="flex items-center gap-3 mb-3">
                                <button onClick={() => { setSelectedId(null); setSelectedConversation(null); }} className="md:hidden text-text-muted hover:text-text-primary">
                                    <ArrowLeft className="h-5 w-5" />
                                </button>
                                <div className="h-8 w-8 rounded-full bg-surface-3 text-amber-400 flex items-center justify-center text-sm font-medium font-display">
                                    {selectedConversation.contact?.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-text-primary">{selectedConversation.contact?.name}</p>
                                        {/* AI Analysis Badges */}
                                        {aiAnalysis && (
                                            <div className="flex items-center gap-2 animate-fadeIn">
                                                <Badge color={SENTIMENT_COLORS[aiAnalysis.sentiment]}>
                                                    {aiAnalysis.sentiment}
                                                </Badge>
                                                <Badge color="purple">
                                                    {aiAnalysis.intent}
                                                </Badge>
                                                {aiAnalysis.tags.map(tag => (
                                                    <Badge key={tag} color="blue">{tag}</Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-text-muted">
                                        {selectedConversation.contact?.email}
                                        {selectedConversation.contact?.phone && ` · ${selectedConversation.contact.phone}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setShowTestReply(true)}
                                        className="p-2 text-text-muted hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                                        title="Simulate customer reply (for testing)"
                                    >
                                        <TestTube className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(selectedConversation.id)}
                                        className="p-2 text-text-muted hover:text-error-500 hover:bg-error-50 rounded-lg transition-colors"
                                        title="Delete conversation"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* AI Insight Box (if analysis exists) */}
                            {aiAnalysis && (
                                <div className="bg-purple-900/20 rounded-lg p-3 flex items-start gap-3 animate-fadeIn border border-purple-500/10">
                                    <BrainCircuit className="h-5 w-5 text-purple-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs font-semibold text-purple-300 font-display">AI Insight</p>
                                        <p className="text-xs text-purple-400/80 mt-0.5">
                                            This customer seems <strong>{aiAnalysis.sentiment.toLowerCase()}</strong> and is interested in <strong>{aiAnalysis.intent.toLowerCase()}</strong>.
                                            Suggested priority score: {aiAnalysis.score}/10.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-0">
                            {selectedConversation.messages?.length === 0 ? (
                                <div className="text-center py-8 text-text-muted text-sm">No messages in this conversation yet. Send the first one below.</div>
                            ) : (
                                selectedConversation.messages?.map((msg: Message) => (
                                    <div key={msg.id} className={`flex ${msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${msg.direction === 'OUTBOUND'
                                            ? 'bg-amber-500 text-surface-0 rounded-br-md'
                                            : 'bg-surface-2 text-text-primary rounded-bl-md border border-white/[0.24]'
                                            }`}>
                                            <p>{msg.content}</p>
                                            <div className={`flex items-center gap-1.5 mt-1 text-xs ${msg.direction === 'OUTBOUND' ? 'text-amber-100/60' : 'text-text-muted'}`}>
                                                {msg.sender?.name && <span className="font-medium">{msg.sender.name}</span>}
                                                {msg.sender?.name && <span>·</span>}
                                                <span className={`inline-flex items-center gap-0.5 ${msg.direction === 'OUTBOUND' ? 'text-amber-100/60' : 'text-text-muted'}`}>
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
                        <div className="p-4 border-t border-white/[0.24] bg-surface-1">
                            {/* AI Draft Suggestion */}
                            {draftReply && (
                                <div className="mb-3 p-3 bg-purple-900/20 border border-purple-500/10 rounded-lg animate-slideUp">
                                    <div className="flex items-start gap-2">
                                        <Sparkles className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold text-purple-300 mb-1 font-display">AI Suggested Reply</p>
                                            <p className="text-sm text-text-secondary italic mb-2">"{draftReply}"</p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={useDraftReply}
                                                    className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-md hover:bg-purple-500 transition-colors"
                                                >
                                                    Use this reply
                                                </button>
                                                <button
                                                    onClick={() => setDraftReply(null)}
                                                    className="text-xs text-text-muted hover:text-text-secondary px-2 py-1.5"
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2">
                                {/* Channel selector */}
                                <div className="flex items-center">
                                    <button
                                        onClick={() => setSendChannel(sendChannel === 'EMAIL' ? 'SMS' : 'EMAIL')}
                                        className={`px-3 py-2.5 border rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${sendChannel === 'EMAIL'
                                            ? 'border-blue-500/30 bg-blue-900/20 text-blue-400'
                                            : 'border-emerald-500/30 bg-emerald-900/20 text-emerald-400'
                                            }`}
                                        title={`Sending via ${sendChannel}. Click to switch.`}
                                    >
                                        {sendChannel === 'EMAIL' ? <Mail className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
                                        {sendChannel}
                                    </button>
                                </div>
                                <button
                                    onClick={handleSmartReply}
                                    disabled={generatingReply}
                                    className="p-2.5 border border-purple-500/20 bg-purple-900/20 text-purple-400 rounded-lg hover:bg-purple-900/30 disabled:opacity-50 transition-colors"
                                    title="Generate Smart Reply with AI"
                                >
                                    {generatingReply ? (
                                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-purple-400"></div>
                                    ) : (
                                        <Sparkles className="h-3.5 w-3.5" />
                                    )}
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={`Type a message (${sendChannel})...`}
                                    className="flex-1 input"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={sending || !newMessage.trim()}
                                    className="px-4 py-2.5 bg-amber-500 text-surface-0 rounded-lg hover:bg-amber-400 disabled:opacity-50 transition-colors"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setShowTestReply(false)}>
                    <div className="bg-surface-1 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-scaleIn border border-white/[0.16]" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b border-white/[0.24]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TestTube className="h-5 w-5 text-amber-400" />
                                    <h3 className="text-lg font-semibold text-text-primary font-display">Simulate Customer Reply</h3>
                                </div>
                                <button onClick={() => setShowTestReply(false)} className="text-text-muted hover:text-text-primary">
                                    <ArrowLeft className="h-5 w-5" />
                                </button>
                            </div>
                            <p className="text-xs text-text-muted mt-2">For testing: Add a message as if the customer replied</p>
                        </div>

                        <div className="p-5 space-y-4">
                            <div>
                                <label className="label">Channel</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setTestReplyChannel('EMAIL')}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${testReplyChannel === 'EMAIL'
                                            ? 'border-blue-500/30 bg-blue-900/20 text-blue-400'
                                            : 'border-white/[0.16] bg-surface-2 text-text-secondary hover:bg-surface-3'
                                            }`}
                                    >
                                        <Mail className="h-4 w-4" />
                                        Email
                                    </button>
                                    <button
                                        onClick={() => setTestReplyChannel('SMS')}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${testReplyChannel === 'SMS'
                                            ? 'border-emerald-500/30 bg-emerald-900/20 text-emerald-400'
                                            : 'border-white/[0.16] bg-surface-2 text-text-secondary hover:bg-surface-3'
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
