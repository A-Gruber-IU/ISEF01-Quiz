import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, getDoc, doc, setDoc } from 'firebase/firestore';
import { useFirebase } from './useFirebase';
import { Box, TextField, Button, List, ListItem, ListItemText, Typography, Paper, Snackbar } from '@mui/material';

export default function Chat({ chatType, chatId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { firestore, auth } = useFirebase();
  const [shouldScroll, setShouldScroll] = useState(false);
  const [error, setError] = useState(null);
  const activeUser = auth.currentUser;

  useEffect(() => {
    if (!chatId || !chatType) {
      console.error("Chat ID or type is missing");
      return;
    }

    const chatRef = collection(firestore, chatType, chatId, 'messages');
    const q = query(chatRef, orderBy('timestamp', 'asc'), limit(50));

    const checkForMessages = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      }));
      setMessages(newMessages);
      setShouldScroll(true);
    }, (err) => {
      console.error("Error fetching messages:", err);
      setError("Nachrichten konnten nicht geladen werden. Versuch es später noch einmal.");
    });

    return () => checkForMessages();
  }, [chatId, chatType, firestore]);

  useEffect(() => {
    if (shouldScroll) {
      const chatContainer = document.getElementById('chat-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
      setShouldScroll(false);
    }
  }, [shouldScroll]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    
    try {
      if (chatType === 'private_chats') {
        const privateChatDocRef = doc(firestore, 'private_chats', chatId);
        const privateChatDoc = await getDoc(privateChatDocRef);
        if (!privateChatDoc.exists()) {
          throw new Error("Chat does not exist.");
        } else if (!privateChatDoc.data().users.includes(activeUser.uid)) {
          console.log("User-ID:", activeUser.uid);
          throw new Error("You are not a participant in this chat.");
        }
      }
  
      const chatRef = collection(firestore, chatType, chatId, 'messages');
      await addDoc(chatRef, {
        text: newMessage,
        authorId: activeUser.uid,
        authorName: activeUser.displayName,
        timestamp: serverTimestamp(),
      });
  
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Fehler beim Senden der Nachricht");
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '400px', width: '100%', maxWidth: '800px' }}>
      <Paper 
        elevation={3} 
        sx={{ flex: 1, overflow: 'auto', mb: 2, p: 2 }}
        id="chat-container"
      >
        <List>
          {messages.map((message) => (
            <ListItem key={message.id} sx={{ 
              justifyContent: message.authorId === activeUser?.uid ? 'flex-end' : 'flex-start',
            }}>
              <Paper elevation={1} sx={{ 
                p: 1, 
                maxWidth: '70%',
                backgroundColor: message.authorId === activeUser?.uid ? 'primary.light' : 'background.paper',
              }}>
                <ListItemText
                  primary={message.text}
                  secondary={`${message.authorName === activeUser.displayName ? " Du" : message.authorName} - ${message.timestamp?.toLocaleTimeString()}`}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
              </Paper>
            </ListItem>
          ))}
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
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        message={error}
      />
    </Box>
  );
}