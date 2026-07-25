import {
    collection,
    addDoc,
    updateDoc,
    doc,
    query,
    where,
    orderBy,
    getDocs,
    getDoc,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { db } from './firestore';
import { Message } from '@/components/chat/ChatMessage';

export interface ChatSession {
    id: string;
    userId: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    messageCount: number;
    lastMessage?: string;
}

export interface StoredMessage extends Message {
    sessionId: string;
    userId: string;
}

/**
 * Create a new chat session
 */
export async function createChatSession(userId: string, title: string = 'New Chat'): Promise<string> {
    const sessionRef = await addDoc(collection(db, 'chatSessions'), {
        userId,
        title,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        messageCount: 0,
    });

    return sessionRef.id;
}

/**
 * Get all chat sessions for a user
 */
export async function getUserChatSessions(userId: string): Promise<ChatSession[]> {
    const q = query(
        collection(db, 'chatSessions'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            userId: data.userId,
            title: data.title,
            createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
            updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
            messageCount: data.messageCount || 0,
            lastMessage: data.lastMessage,
        };
    });
}

/**
 * Get a specific chat session
 */
export async function getChatSession(sessionId: string): Promise<ChatSession | null> {
    const docRef = doc(db, 'chatSessions', sessionId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }

    const data = docSnap.data();
    return {
        id: docSnap.id,
        userId: data.userId,
        title: data.title,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
        messageCount: data.messageCount || 0,
        lastMessage: data.lastMessage,
    };
}

/**
 * Save a message to a chat session
 */
export async function saveMessage(
    sessionId: string,
    message: Message,
    userId: string
): Promise<void> {
    // Save message
    await addDoc(collection(db, 'messages'), {
        sessionId,
        userId,
        role: message.role,
        content: message.content,
        places: message.places || [],
        events: message.events || [],
        followUpQuestions: message.followUpQuestions || [],
        showEventSuggestion: message.showEventSuggestion || false,
        timestamp: serverTimestamp(),
    });

    // Update session
    const sessionRef = doc(db, 'chatSessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (sessionSnap.exists()) {
        const currentCount = sessionSnap.data().messageCount || 0;
        await updateDoc(sessionRef, {
            updatedAt: serverTimestamp(),
            messageCount: currentCount + 1,
            lastMessage: message.content.substring(0, 100),
        });
    }
}

/**
 * Get all messages for a chat session
 */
export async function getSessionMessages(sessionId: string): Promise<Message[]> {
    const q = query(
        collection(db, 'messages'),
        where('sessionId', '==', sessionId),
        orderBy('timestamp', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            role: data.role,
            content: data.content,
            places: data.places || [],
            events: data.events || [],
            followUpQuestions: data.followUpQuestions || [],
            showEventSuggestion: data.showEventSuggestion || false,
            timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
        };
    });
}

/**
 * Update chat session title
 */
export async function updateSessionTitle(sessionId: string, title: string): Promise<void> {
    const sessionRef = doc(db, 'chatSessions', sessionId);
    await updateDoc(sessionRef, {
        title,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Delete a chat session and all its messages
 */
export async function deleteChatSession(sessionId: string): Promise<void> {
    // Delete all messages
    const messagesQuery = query(
        collection(db, 'messages'),
        where('sessionId', '==', sessionId)
    );
    const messagesSnapshot = await getDocs(messagesQuery);

    const deletePromises = messagesSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
    );
    await Promise.all(deletePromises);

    // Delete session
    const sessionRef = doc(db, 'chatSessions', sessionId);
    await deleteDoc(sessionRef);
}

// Import deleteDoc
import { deleteDoc } from 'firebase/firestore';
