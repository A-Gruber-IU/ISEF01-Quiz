import { useState, useEffect, useCallback } from 'react';
import { ref as databaseRef, onValue, set, onDisconnect, get, remove } from 'firebase/database';
import { useFirebase } from '../useFirebase';

export const defaultStatuses = {
  online: true,
  coop: false,
  competition: false,
  matchingUserId: null,
  gameId: null
};

export function useUserStatuses(courseId) {
  const { auth, database } = useFirebase();
  const activeUser = auth.currentUser;
  const [currentUserStatuses, setCurrentUserStatuses] = useState(defaultStatuses);

  const exitPrivateLobby = useCallback((privateLobbyId) => {
    console.log("XXX exitPrivateLobby called XX")
    if (!privateLobbyId) return;

    // Remove private lobby
    const privateLobbyRef = databaseRef(database, `private_lobbies/${privateLobbyId}`);
    remove(privateLobbyRef).catch(error => console.error("Error removing private lobby:", error));

    // Reset user status
    const userStatusRef = databaseRef(database, `lobbies/${courseId}/${activeUser.uid}`);
    set(userStatusRef, defaultStatuses).catch(error => console.error("Error resetting user status:", error));
  }, [database, courseId, activeUser]);

  useEffect(() => {
    async function initializeCurrentUserStatuses() {
      if (courseId && activeUser) {
        const userStatusRef = databaseRef(database, `lobbies/${courseId}/${activeUser.uid}`);
        const userStatusSnapshot = await get(userStatusRef);
        const userStatusVal = userStatusSnapshot.val();
        if (userStatusVal) {
          setCurrentUserStatuses(userStatusVal);
        }
      }
    }
    initializeCurrentUserStatuses();
  }, [activeUser, courseId, database]);

  useEffect(() => {
    if (!activeUser || !courseId) return;

    const connectedRef = databaseRef(database, '.info/connected');
    const userStatusRef = databaseRef(database, `lobbies/${courseId}/${activeUser.uid}`);

    const checkConnectionStatus = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        // Set the user as online when connected
        set(userStatusRef, { ...currentUserStatuses, online: true });

        // Remove the user when disconnected
        onDisconnect(userStatusRef).remove();
      }
    });

    return () => {
      checkConnectionStatus();
    };
  }, [courseId, database, activeUser, currentUserStatuses]);

  const handleStatusChange = useCallback(async (newStatuses) => {
    if (activeUser && courseId) {
      const userStatusRef = databaseRef(database, `lobbies/${courseId}/${activeUser.uid}`);
      await set(userStatusRef, newStatuses);
      const userStatusSnapshot = await get(userStatusRef);
      const userStatusVal = userStatusSnapshot.val();
      console.log("User Statuses: ", userStatusVal)
      setCurrentUserStatuses(userStatusVal);
    }
  }, [activeUser, courseId, database]);

  return { currentUserStatuses, handleStatusChange, setCurrentUserStatuses, exitPrivateLobby };
}