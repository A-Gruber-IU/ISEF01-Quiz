import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { Box, Typography } from '@mui/material';
import Chat from '../Chat';
import { useFirebase } from '../useFirebase';

export default function PrivateChat({chatId}) {
  const { firestore, database, auth } = useFirebase();
  const [lobbyData, setLobbyData] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const lobbyRef = ref(database, `private_lobbies/${chatId}`);
    const unsubscribe = onValue(lobbyRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setLobbyData(data);

        let otherUserId = null;
          if (data.user1 == auth.currentUser.uid || data.user2 != auth.currentUser.uid) {
            otherUserId = data.user2;
          } else if (data.user2 == auth.currentUser.uid || data.user1 != auth.currentUser.uid) {
            otherUserId = data.user1;
          } else {
            alert("Fehler. Anderer Chat-Teilnehmer konnte nicht gefunden werden.");
          }
        const userDoc = await getDoc(doc(firestore, 'users', otherUserId));
        setOtherUser(userDoc.data());
      } else {
        // If lobby doesn't exist, navigate back to dashboard
        // TODO further error handling, user feedback
        navigate('/dashboard');
      }
    });

    unsubscribe();
  }, [chatId, firestore, database, auth, navigate]);

  if (!lobbyData || !otherUser) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Chat 
        chatType="private_chats"
        chatId={chatId}
      />
    </Box>
  );
}