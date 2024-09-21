import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { ref, onValue, set, onDisconnect } from 'firebase/database';

import { List, ListItem, ListItemText, ListItemIcon, CircularProgress, Button, ButtonGroup, Chip, Box } from '@mui/material';
import "../Layout/styles.css";

import { useFirebase } from '../useFirebase';

const statusColors = {
  coop: 'warning',
  competition: 'success',
};

const statusLabels = {
  coop: 'Competition',
  competition: 'Coop',
};

export default function Component({ activeCourse }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStatuses, setUserStatuses] = useState({
    coop: false,
    competition: false,
    online: false
  });
  const [courseId, setCourseId] = useState("");

  const { auth, database, firestore } = useFirebase();
  const activeUser = auth.currentUser;
  
  useEffect(() => {
    if (activeCourse) {
      setCourseId(activeCourse.id);
    }
  }, [activeCourse]);

  useEffect(() => {
    if (!activeUser || !courseId) return;

    const lobbyRef = ref(database, `lobbies/${courseId}`);
    const connectedRef = ref(database, '.info/connected');

    const unsubscribeConnected = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        const userStatusRef = ref(database, `lobbies/${courseId}/${activeUser.uid}`);
        
        // Set the user as online when connected
        set(userStatusRef, { ...userStatuses, online: true });

        // Remove the user when disconnected
        onDisconnect(userStatusRef).remove();
      }
    });

    const unsubscribeLobby = onValue(lobbyRef, async (snapshot) => {
      if (snapshot.exists()) {
        const lobbyData = snapshot.val();
        const userIds = Object.keys(lobbyData);
        
        const userPromises = userIds.map(async (userId) => {
          const userDoc = await getDoc(doc(firestore, 'users', userId));
          return {
            id: userId,
            name: userDoc.data()?.display_name,
            statuses: lobbyData[userId]
          };
        });

        const resolvedUsers = await Promise.all(userPromises);
        setUsers(resolvedUsers);
      } else {
        setUsers([]);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeConnected();
      unsubscribeLobby();
    };
  }, [courseId, firestore, database, activeUser, userStatuses]);

  const handleStatusChange = (status) => {
    const newStatuses = {
      ...userStatuses,
      [status]: !userStatuses[status]
    };
    setUserStatuses(newStatuses);

    if (activeUser && courseId) {
      const userStatusRef = ref(database, `lobbies/${courseId}/${activeUser.uid}`);
      set(userStatusRef, newStatuses);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <>
      <h2 className='normHeadline'>Kurs-Lobby</h2>
      <ButtonGroup variant="contained" aria-label="status button group">
        {Object.entries(statusLabels).filter(([status]) => status !== 'online').map(([status, label]) => (
          <Button
            key={status}
            onClick={() => handleStatusChange(status)}
            color={statusColors[status]}
            variant={userStatuses[status] ? 'contained' : 'outlined'}
          >
            {label}
          </Button>
        ))}
      </ButtonGroup>
      <List>
        {users.map((user) => user.statuses.online && (
          <ListItem key={user.id}>
            <ListItemText 
              primary={user.name === activeUser.displayName ? "Du" : user.name} 
              secondary={
                <Box>
                  {Object.entries(user.statuses).filter(([status]) => status !== 'online').map(([status, isActive]) => 
                    isActive && (
                      <Chip 
                        key={status} 
                        label={statusLabels[status]} 
                        color={statusColors[status]} 
                        size="small" 
                        style={{ marginRight: 4 }}
                      />
                    )
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
        {users.length === 0 && (
          <ListItem>
            <ListItemText primary="No users in the lobby" />
          </ListItem>
        )}
      </List>
      {/* <LobbyChat 
        courseId={courseId}
        users={users}
        currentUserId={activeUser.uid}
      /> */}
    </>
  );
}