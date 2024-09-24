import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';
import { ref as databaseRef, set, remove, onDisconnect } from 'firebase/database';
import { useFirebase } from './useFirebase';

export function useActiveCourse(userId) {
  const [activeCourse, setActiveCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const { storage, firestore, database } = useFirebase();

  useEffect(() => {
    async function fetchActiveCourse() {
      if (!userId) return;

      try {
        console.log("Active user ID:", userId);
        const userDocRef = doc(firestore, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().active_course) {
          const activeCourseId = userDoc.data().active_course;
          const courseDocRef = doc(firestore, 'courses', activeCourseId);
          const courseDoc = await getDoc(courseDocRef);

          if (courseDoc.exists()) {
            const courseData = courseDoc.data();
            console.log("Active course:", courseData);
            const imageUrl = await getDownloadURL(storageRef(storage, courseData.image_path));
            setActiveCourse({
              id: activeCourseId,
              ...courseData,
              imageUrl
            });

            // Join the lobby for the active course
            joinLobby(userId, activeCourseId);
          }
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

  const joinLobby = (userId, courseId) => {
    const userStatusRef = databaseRef(database, `lobbies/${courseId}/${userId}`);
    set(userStatusRef, {
      online: true,
    });
    onDisconnect(userStatusRef).remove();
  };

  const leaveLobby = (userId, courseId) => {
    const userStatusRef = databaseRef(database, `lobbies/${courseId}/${userId}`);
    remove(userStatusRef);
  };

  const updateActiveCourse = async (courseId) => {
    if (!userId) return;

    // Leave the current lobby if there's an active course
    if (activeCourse) {
      leaveLobby(userId, activeCourse.id);
    }

    const userDocRef = doc(firestore, 'users', userId);
    await setDoc(userDocRef, {
      active_course: courseId
    }, { merge: true });

    const courseDocRef = doc(firestore, 'courses', courseId);
    const courseDoc = await getDoc(courseDocRef);

    if (courseDoc.exists()) {
      const courseData = courseDoc.data();
      const imageUrl = await getDownloadURL(storageRef(storage, courseData.image_path));
      const newActiveCourse = {
        id: courseId,
        ...courseData,
        imageUrl
      };
      setActiveCourse(newActiveCourse);

      // Join the new lobby
      joinLobby(userId, courseId);
    }
  };

  return { activeCourse, loading, updateActiveCourse };
}