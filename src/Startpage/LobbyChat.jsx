import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '../useFirebase';
import { Box, TextField, Button, List, ListItem, ListItemText, Typography, Paper } from '@mui/material';

interface ChatProps {
  courseId: string;
  users: { id: string; name: string }[];
  currentUserId: string;
}

interface Message {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  timestamp: Date;
}

export default function LobbyChat({ courseId, users, currentUserId }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { firestore } = useFirebase();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chatRef = collection(firestore, 'chats', courseId, 'messages');
    const q = query(chatRef, orderBy('timestamp', 'asc'), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      })) as Message[];
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [courseId, firestore]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const chatRef = collection(firestore, 'chats', courseId, 'messages');
    const currentUser = users.find(user => user.id === currentUserId);

    await addDoc(chatRef, {
      text: newMessage,
      authorId: currentUserId,
      authorName: currentUser?.name || 'Unknown User',
      timestamp: serverTimestamp(),
    });

    setNewMessage('');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '400px', width: '100%', maxWidth: '600px' }}>
      <Typography variant="h6" component="h3" gutterBottom>
        Chat
      </Typography>
      <Paper elevation={3} sx={{ flex: 1, overflow: 'auto', mb: 2, p: 2 }}>
        <List>
          {messages.map((message) => (
            <ListItem key={message.id} sx={{ 
              justifyContent: message.authorId === currentUserId ? 'flex-end' : 'flex-start',
            }}>
              <Paper elevation={1} sx={{ 
                p: 1, 
                maxWidth: '70%',
                backgroundColor: message.authorId === currentUserId ? 'primary.light' : 'background.paper',
              }}>
                <ListItemText
                  primary={message.text}
                  secondary={`${message.authorName} - ${message.timestamp?.toLocaleTimeString()}`}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
              </Paper>
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Paper>
      <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          sx={{ mr: 1 }}
        />
        <Button type="submit" variant="contained" color="primary">
          Send
        </Button>
      </Box>
    </Box>
  );
}