import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';
import { ref as databaseRef, set, remove, onDisconnect, get } from 'firebase/database';
import { useFirebase } from '../useFirebase';

export function useActiveCourse() {
  const [activeCourse, setActiveCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { storage, firestore, database, auth } = useFirebase();
  const userId = auth?.currentUser?.uid;
  const defaultStatuses = { online: true, coop: false, competition: false, matching_user_id: null, game_id: null };

  useEffect(() => {
    async function fetchActiveCourse() {
      if (!userId) return;

      try {
        const userDocRef = doc(firestore, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().active_course && userDoc.data().active_course != '') {
          const activeCourseId = userDoc.data().active_course;
          const courseDocRef = doc(firestore, 'courses', activeCourseId);
          const courseDoc = await getDoc(courseDocRef);

          if (courseDoc.exists()) {
            const courseData = courseDoc.data();
            const imageUrl = await getDownloadURL(storageRef(storage, courseData.image_path));
            setActiveCourse({
              id: activeCourseId,
              ...courseData,
              imageUrl
            });

            // Join the lobby for the active course
            joinLobby(userId, activeCourseId);
          } else {
            console.error("Active course document does not exist");
          }
        } else if (userDoc.exists() && (!userDoc.data().active_course || userDoc.data().active_course == '')) {
          setActiveCourse({id: 0});
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchActiveCourse();

    // Cleanup function to leave the lobby when the component unmounts
    return () => {
      if (activeCourse) {
        leaveLobby(userId, activeCourse.id);
      }
    };
  }, [userId, firestore, storage, database]);


  async function joinLobby(userId, courseId) {
    console.log("Joining Lobby...");
    const userStatusRef = databaseRef(database, `lobbies/${courseId}/${userId}`);
    try {
      await set(userStatusRef, defaultStatuses);
  
      // Set up onDisconnect to handle user disconnecting --> removes their statuses from DB
      try {
        await onDisconnect(userStatusRef).remove();
        console.log("onDisconnect handler set successfully.");
      } catch (error) {
        console.error("Error setting onDisconnect handler:", error);
      }
  
      console.log("Joined new course Lobby.");
    } catch (error) {
      console.error("Error getting data:", error);
    }
  };

  async function leaveLobby(userId, courseId) {
    const userStatusRef = databaseRef(database, `lobbies/${courseId}/${userId}`);
    await remove(userStatusRef);
  };

  async function updateActiveCourse(courseId) {
    if (!userId) {
      console.log("!userId");
      return;
    }

    // Leave the current lobby if there's an active course selected
    if (activeCourse) {
      await leaveLobby(userId, activeCourse.id);
    }

    const userDocRef = doc(firestore, 'users', userId);
    await setDoc(userDocRef, {
      active_course: courseId
    }, { merge: true });

    const courseDocRef = doc(firestore, 'courses', courseId);
    const courseDoc = await getDoc(courseDocRef);
    console.log("courseDoc: ", courseDoc);
    if (courseDoc.exists()) {
      const courseData = courseDoc.data();
      const imageUrl = await getDownloadURL(storageRef(storage, courseData.image_path));
      const newActiveCourse = {
        id: courseId,
        ...courseData,
        imageUrl
      };
      console.log("newActiveCourse: ", newActiveCourse);
      // Join the new lobby
      await joinLobby(userId, courseId);
      setActiveCourse(newActiveCourse);
    } else {
      console.error("Error while loading new course data.")
    }
  }

  return { activeCourse, loading, updateActiveCourse, joinLobby };
}