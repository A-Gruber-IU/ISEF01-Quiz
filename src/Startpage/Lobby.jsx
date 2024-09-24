import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ref as databaseRef, onValue, set, onDisconnect, push, get, remove } from 'firebase/database';
import { useNavigate } from 'react-router-dom';

import { List, ListItem, ListItemText, CircularProgress, Button, Chip, Box, Paper, Stack, IconButton } from '@mui/material';
import Grid from '@mui/material/Grid2';
import "../Layout/styles.css";
import Chat from '../Chat';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import QueryStatsIcon from '@mui/icons-material/QueryStats';

import { useFirebase } from '../useFirebase';
import { ActiveCourseDisplay } from './ActiveCourseDisplay';
import { useActiveCourse } from '../useActiveCourse';

export default function Lobby() {

  const { auth, database, firestore } = useFirebase();
  const activeUser = auth.currentUser;
  const { activeCourse, courseLoading, updateActiveCourse } = useActiveCourse(activeUser.uid);

  function handleChangeCourse(courseId) {
    updateActiveCourse(courseId);
  };


  console.log("Render.");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState("");
  const navigate = useNavigate();
  const [currentUserStatuses, setCurrentUserStatuses] = useState({
    online: true,
    coop: false,
    competition: false,
    matchingUserId: null,
    gameId: null
  });

  useEffect(() => {
    if (activeCourse) {
      setCourseId(activeCourse.id);
    }
  }, [activeCourse]);

  useEffect(() => {
    async function initializeCurrentUserStatuses() {
      const userStatusRef = databaseRef(database, `lobbies/${courseId}/${activeUser.uid}`);
      const userStatusSnapshot = await get(userStatusRef);
      const userStatusVal = userStatusSnapshot.val();
      setCurrentUserStatuses(userStatusVal);
    }
    initializeCurrentUserStatuses();
  }, [activeUser.uid, courseId, database]);

  useEffect(() => {
    console.log("useEffect Hook triggered for connection status and user data.");
    if (!activeUser || !courseId) return;

    const lobbyRef = databaseRef(database, `lobbies/${courseId}`);
    const connectedRef = databaseRef(database, '.info/connected');

    const checkConnectionStatus = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        const userStatusRef = databaseRef(database, `lobbies/${courseId}/${activeUser.uid}`);

        // Set the user as online when connected
        set(userStatusRef, { ...currentUserStatuses, online: true });

        // Remove the user when disconnected
        onDisconnect(userStatusRef).remove();
      }
    });

    const getAllUsersData = onValue(lobbyRef, async (snapshot) => {
      console.log("getAllUsersData triggered.");
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
        setUsers((prevUsers) => {
          if (JSON.stringify(prevUsers) !== JSON.stringify(resolvedUsers)) {
            return resolvedUsers;
          }
          return prevUsers;
        });

        const matchingUser = users.find(user =>
          user.id !== activeUser.uid &&
          ((user.statuses["coop"] && currentUserStatuses["coop"]) || (user.statuses["competition"] && currentUserStatuses["competition"])) &&
          user.statuses["matching_user_id"] == activeUser.uid
        );

        if (matchingUser) {
          try {
            await enterGameLobby(matchingUser);
          } catch (error) {
            console.error("Failed to enter Lobby.", error.message)
          }

        }
      } else {
        setUsers([]);
      }
      setLoading(false);
    });
    return () => {
      checkConnectionStatus();
      getAllUsersData();
    };

    async function enterGameLobby(matchingUser) {
      console.log("Starting new Game. Matching user: ", matchingUser)
      const gameId = matchingUser.statuses.game_id;
      console.log("gameId: ", gameId)
      const gameRef = databaseRef(database, `private_lobbies/${gameId}`);
      const gameSnapshot = await get(gameRef);
      const gameVal = gameSnapshot.val();
      console.log("gameVal", gameVal)
      const gameMode = gameVal.gameMode;
      console.log("Game Mode: ", gameMode)
      // Navigate to the private lobby
      navigate(`/${gameMode}/${gameId}`);
    }

  }, [courseId, firestore, database, activeUser, currentUserStatuses, users, navigate]);


  async function handleStatusChange(status) {
    let newStatuses = JSON.parse(JSON.stringify(currentUserStatuses));
    console.log("status: ", status);
    newStatuses[status] = !currentUserStatuses[status];
    console.log("newStatuses after initial change: ", newStatuses);

    let gameId = null;

    const currentUser = users.find(user => user.id === activeUser.uid);
    if (!currentUser) return;

    // Check for match with other user and set up game if there is a match
    if (newStatuses[status]) {
      console.log("users: ", users);
      const match = users.find(user =>
        user.id !== activeUser.uid && user.statuses[status]
      );
      console.log("match: ", match);

      if (match) {
        // Check if an old game already exists and if so, delete
        const privateLobbiesRef = databaseRef(database, `private_lobbies`);
        const privateLobbiesSnapshot = await get(privateLobbiesRef);
        if (privateLobbiesSnapshot.exists()) {
          const privateLobbies = privateLobbiesSnapshot.val();
          const existingPrivateLobby = Object.entries(privateLobbies).find(([_, lobby]) =>
            lobby.users &&
            lobby.users.includes(activeUser.uid) &&
            lobby.users.includes(match.id) &&
            lobby.status === status
          );
          if (existingPrivateLobby) {
            console.log("There is an existing game for these two users. Deleting.")
            await remove(databaseRef(database, `private_lobbies/${existingPrivateLobby[0]}`));
          }
        }

        // Create a new private lobby in realtime database
        const privateLobbyRef = databaseRef(database, `private_lobbies`);
        const newPrivateLobbyRef = push(privateLobbyRef, {
          users: [activeUser.uid, match.id],
          gameMode: status
        });
        gameId = newPrivateLobbyRef.key;
        console.log("Creating new game lobby with game-ID: ", gameId);
        console.log("Game mode: ", status);


        // Create a new private chat in firestore
        const privateChatRef = doc(firestore, `private_chats`, gameId);
        await setDoc(privateChatRef, {
          users: [activeUser.uid, match.id],
          createdAt: serverTimestamp()
        });
        console.log("Game-ID:", gameId);
        console.log("Matching user's ID:", match.id);
        newStatuses["game_id"] = gameId;
        newStatuses["matching_user_id"] = match.id;
        const userStatusRef = databaseRef(database, `lobbies/${courseId}/${activeUser.uid}`);
        await set(userStatusRef, newStatuses);
        console.log("New Statuses in DB before navigation to game lobby:", newStatuses)
        navigate(`/${status}/${gameId}`);
      }
    }
    if (activeUser && courseId) {
      const userStatusRef = databaseRef(database, `lobbies/${courseId}/${activeUser.uid}`);
      console.log("newStatuses before Update in DB: ", newStatuses)
      await set(userStatusRef, newStatuses);
      const userStatusSnapshot = await get(userStatusRef);
      const userStatusVal = userStatusSnapshot.val();
      console.log("New Statuses in DB: ", userStatusVal);
      setCurrentUserStatuses(userStatusVal);
      console.log("New currentUserStatuses: ", currentUserStatuses);
    }
  }

  if (loading) {
    return <CircularProgress />;
  }


  return (
    <>
      <Grid container spacing={2} size={{ xs: 12, md: 8, lg: 7, xl: 6 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={8} sx={{ py: 2, px: 2, textAlign: "center", backgroundColor: currentUserStatuses.coop ? "#55FF4D" : "" }} onClick={() => handleStatusChange("coop")}>
            <Box>
              <Stack sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconButton aria-label="Coop-Modus" onClick={() => handleStatusChange("coop")}>
                  <Diversity3Icon fontSize='large' />
                </IconButton>
                <Button color='plainBlack' variant='text' onClick={() => handleStatusChange("coop")}>
                  Coop-Modus
                </Button>
                {currentUserStatuses["coop"] ? <p className='smallDenseText' > Suche Mitspieler!</p> : <p className='smallDenseText'>Testet euer Wissen gemeinsam!</p>}
              </Stack>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={8} sx={{ py: 2, px: 2, textAlign: "center", backgroundColor: currentUserStatuses.competition ? "#55FF4D" : "" }} onClick={() => handleStatusChange("competition")}>
            <Box>
              <Stack sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconButton aria-label="Competition-Modus" onClick={() => handleStatusChange("competition")}>
                  <EmojiEventsIcon fontSize='large' />
                </IconButton>
                <Button color='plainBlack' variant='text' onClick={() => handleStatusChange("competition")}>
                  Competition-Modus
                </Button>
                {currentUserStatuses["competition"] ? <p className='smallDenseText' >Suche Gegenspieler!</p> : <p className='smallDenseText'>Messe dich mit anderen!</p>}
              </Stack>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={8} sx={{ py: 2, px: 2, textAlign: "center" }} onClick={() => navigate("single")}>
            <Box>
              <Stack sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconButton aria-label="Singleplayer-Modus" onClick={() => navigate("single")}>
                  <SportsEsportsIcon fontSize='large' />
                </IconButton>
                <Button color='plainBlack' variant='text' onClick={() => navigate("single")}>
                  Singleplayer-Modus
                </Button>
                <p className='smallDenseText'>Knack den Highscore!</p>
              </Stack>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={8} sx={{ py: 2, px: 2, textAlign: "center" }} onClick={() => navigate("dashboard")}>
            <Box>
              <Stack sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconButton aria-label="Dashboard" onClick={() => navigate("dashboard")}>
                  <QueryStatsIcon fontSize='large' />
                </IconButton>
                <Button color='plainBlack' variant='text' onClick={() => navigate("dashboard")}>
                  Dashboard
                </Button>
                <p className='smallDenseText'>Check deinen Fortschritt!</p>
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <h2 className='normHeadline'>Kurs-Lobby</h2>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 5, md: 3 }}>
          <ActiveCourseDisplay
            activeCourse={activeCourse}
            courseLoading={courseLoading}
            handleChangeCourse={handleChangeCourse}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid>
          <Chat
            chatType="lobby_chats"
            chatId={courseId}
          />
          </Grid>
          <Grid>
            <Paper sx={{marginTop: 3, maxWidth: "10rem"}}>
            <h4 className='normHeadline' style={{marginTop: 2}}>Online Studierende</h4>
              <List>
                {users.map((user) => user.statuses.online && (
                  <ListItem key={user.id}>
                    <ListItemText
                      primary={user.name === activeUser.displayName ? "Du" : user.name}
                      secondary={
                        <Box>
                          {user.statuses.coop && (
                            <Chip
                              label={"coop"}
                              color={"success"}
                              size="small"
                              style={{ marginRight: 4 }} />)}
                          {user.statuses.competition && (
                            <Chip
                              label={"competition"}
                              color={"warning"}
                              size="small"
                              style={{ marginRight: 4 }} />)}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
                {users.length === 0 && (
                  <ListItem>
                    <ListItemText primary="Keine anderen Studierenden online." />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}