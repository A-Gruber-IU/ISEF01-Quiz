import { useState, useEffect } from 'react';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ref as databaseRef, onValue, set, push, get, remove } from 'firebase/database';
import { NavLink, useNavigate } from 'react-router-dom';

import { List, ListItem, ListItemText, CircularProgress, Button, Chip, Box, Paper, Stack, IconButton, Typography, Card, CardContent } from '@mui/material';
import Grid from '@mui/material/Grid2';
import "../Layout/styles.css";
import Chat from '../Chat';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import QueryStatsIcon from '@mui/icons-material/QueryStats';

import { useFirebase } from '../useFirebase';
import { ActiveCourseDisplay } from './ActiveCourseDisplay';
import { useActiveCourse } from '../User/useActiveCourse';
import { useUserStatuses } from '../User/useUserStatuses';

export default function Lobby() {
  const { auth, database, firestore } = useFirebase();
  const activeUser = auth.currentUser;
  const { activeCourse, courseLoading, updateActiveCourse } = useActiveCourse(activeUser?.uid);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState("");
  const navigate = useNavigate();
  const { currentUserStatuses, handleStatusChange } = useUserStatuses(courseId);

  function handleChangeCourse(courseId) {
    updateActiveCourse(courseId);
  };

  useEffect(() => {
    if (activeCourse) {
      setCourseId(activeCourse.id);
    }
  }, [activeCourse]);

  useEffect(() => {
    console.log("useEffect Hook triggered for user data.");
    if (!activeUser || !courseId) return;

    const lobbyRef = databaseRef(database, `lobbies/${courseId}`);

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
          ((user.statuses["coop"] && currentUserStatuses.coop) || (user.statuses["competition"] && currentUserStatuses.competition)) &&
          user.statuses["matching_user_id"] == activeUser.uid
        );
        if (matchingUser) {
          console.log("It's a match. Matching user: ", matchingUser);
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
      let newStatuses = { ...currentUserStatuses, game_id: gameId, matching_user_id: matchingUser.id };
      const userStatusRef = databaseRef(database, `lobbies/${courseId}/${activeUser.uid}`);
      await set(userStatusRef, newStatuses);
      // Navigate to the private lobby
      navigate(`/${gameMode}/${gameId}`);
    }

  }, [courseId, firestore, database, activeUser, currentUserStatuses, users, navigate]);

  async function preHandleStatusChange(status) {
    if (!activeUser || !courseId) {
      return;
    }

    let gameId = null;

    const currentUser = users.find(user => user.id === activeUser.uid);
    if (!currentUser) return;

    // Check for match with other user and set up game if there is a match
    if (!currentUserStatuses[status]) {
      console.log("Checking for match. users: ", users);
      const match = users.find(user =>
        user.id !== activeUser.uid && user.statuses[status]
      );
      console.log("Found match: ", match);

      if (match) {
        // Check if an old game already exists and if so, delete
        const privateLobbiesRef = databaseRef(database, `private_lobbies`);
        const privateLobbiesSnapshot = await get(privateLobbiesRef);
        if (privateLobbiesSnapshot.exists()) {
          const privateLobbies = privateLobbiesSnapshot.val();
          const existingPrivateLobby = Object.entries(privateLobbies).find(([_, lobby]) =>
            lobby.users &&
            lobby.users.includes(activeUser.uid) &&
            lobby.users.includes(match.id)
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
        let newStatuses = { ...currentUserStatuses, game_id: gameId, matching_user_id: match.id };
        newStatuses[status] = !currentUserStatuses[status];
        const userStatusRef = databaseRef(database, `lobbies/${courseId}/${activeUser.uid}`);
        await set(userStatusRef, newStatuses);
        console.log("New Statuses in DB before navigation to game lobby:", newStatuses)
        navigate(`/${status}/${gameId}`);
      }
    }
    if (activeUser && courseId && gameId == null) {
      //  Change Status of current user in database if there was no match
      let newStatuses = { ...currentUserStatuses };
      newStatuses[status] = !currentUserStatuses[status];
      handleStatusChange(newStatuses);
    }
  }

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <>
      <Grid container marginBottom={3} spacing={2} size={{ xs: 12 }}>
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <NavLink className="navlink" to={"single"}>
            <Paper elevation={8} sx={{ py: 2, px: 2, textAlign: "center" }}>
              <Box>
                <Stack sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconButton aria-label="Singleplayer-Modus">
                    <SportsEsportsIcon fontSize='large' />
                  </IconButton>
                  <Button color='plainBlack' variant='text'>
                    Singleplayer-Modus
                  </Button>
                  <p className='smallDenseText'>Knack den Highscore!</p>
                </Stack>
              </Box>
            </Paper>
          </NavLink>
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <NavLink className="navlink" to={"dashboard"}>
            <Paper elevation={8} sx={{ py: 2, px: 2, textAlign: "center" }}>
              <Box>
                <Stack sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconButton aria-label="Dashboard">
                    <QueryStatsIcon fontSize='large' />
                  </IconButton>
                  <Button color='plainBlack' variant='text'>
                    Dashboard
                  </Button>
                  <p className='smallDenseText'>Check deinen Fortschritt!</p>
                </Stack>
              </Box>
            </Paper>
          </NavLink>
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Paper elevation={8} sx={{ py: 2, px: 2, textAlign: "center", backgroundColor: currentUserStatuses.coop ? "#55FF4D" : "" }} onClick={() => preHandleStatusChange("coop")}>
            <Box>
              <Stack sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconButton aria-label="Coop-Modus" onClick={() => preHandleStatusChange("coop")}>
                  <Diversity3Icon fontSize='large' />
                </IconButton>
                <Button color='plainBlack' variant='text' onClick={() => preHandleStatusChange("coop")}>
                  Coop-Modus
                </Button>
                {currentUserStatuses.coop ? <p className='smallDenseText' > Suche Mitspieler!</p> : <p className='smallDenseText'>Testet euer Wissen gemeinsam!</p>}
              </Stack>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Paper elevation={8} sx={{ py: 2, px: 2, textAlign: "center", backgroundColor: currentUserStatuses.competition ? "#55FF4D" : "" }} onClick={() => preHandleStatusChange("competition")}>
            <Box>
              <Stack sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconButton aria-label="Competition-Modus" onClick={() => preHandleStatusChange("competition")}>
                  <EmojiEventsIcon fontSize='large' />
                </IconButton>
                <Button color='plainBlack' variant='text' onClick={() => preHandleStatusChange("competition")}>
                  Competition-Modus
                </Button>
                {currentUserStatuses.competition ? <p className='smallDenseText' >Suche Gegenspieler!</p> : <p className='smallDenseText'>Messe dich mit anderen!</p>}
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <h2 className='normHeadline'>Kurs-Lobby</h2>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <ActiveCourseDisplay
            activeCourse={activeCourse}
            courseLoading={courseLoading}
            handleChangeCourse={handleChangeCourse}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 10, md: 8, lg: 6 }}>
          <Chat chatType="lobby_chats" chatId={courseId} />
        </Grid>
        <Card sx={{ marginBottom: 3, width: "13rem" }}>
          <CardContent>
            <Typography variant="subtitle2" className='normHeadline' gutterBottom>
              WER IST ONLINE?
            </Typography>
            <List>
              {users.map((user) => user.statuses.online && (
                <ListItem key={user.id}>
                  <ListItemText
                    primary={user.name === activeUser.displayName ? " > Du" : ` > ${user.name}`}
                    secondary={
                      <Box>
                        {user.statuses.coop && (
                          <Chip
                            label={"coop"}
                            color={"success"}
                            size="small"
                            style={{ marginRight: 4, textOverflow: "ellipsis" }} />)}
                        {user.statuses.competition && (
                          <Chip
                            label={"competition"}
                            color={"warning"}
                            size="small"
                            style={{ marginRight: 4, textOverflow: "ellipsis" }} />)}
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
          </CardContent>
        </Card>


      </Grid>
    </>
  );
}