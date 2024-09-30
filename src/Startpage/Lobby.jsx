import { useState, useEffect } from 'react';
import { doc, getDoc, serverTimestamp as serverTimestampFS, setDoc } from 'firebase/firestore';
import { ref as databaseRef, onValue, set, push, get, remove, serverTimestamp as serverTimestampDB } from 'firebase/database';
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
  const { activeCourse, courseLoading, updateActiveCourse } = useActiveCourse();
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
            uid: userId,
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
          user.uid !== activeUser.uid &&
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
      const gameMode = gameVal.game_mode;
      console.log("Game Mode: ", gameMode)
      let newStatuses = { ...currentUserStatuses, game_id: gameId, matching_user_id: matchingUser.uid };
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

    const currentUser = users.find(user => user.uid === activeUser.uid);
    if (!currentUser) return;

    // Check for match with other user and set up game if there is a match
    if (!currentUserStatuses[status]) {
      console.log("Checking for match. users: ", users);
      const match = users.find(user =>
        user.uid !== activeUser.uid && user.statuses[status]
      );
      console.log("Found match: ", match);

      if (match) {
        // Check if an old game already exists and if so, delete
        const privateLobbiesRef = databaseRef(database, `private_lobbies`);
        const privateLobbiesSnapshot = await get(privateLobbiesRef);
        if (privateLobbiesSnapshot.exists()) {
          const privateLobbies = privateLobbiesSnapshot.val();
          const existingPrivateLobby = Object.entries(privateLobbies).find(([_, lobby]) =>
            (lobby.user1 == activeUser.uid && lobby.user2 == match.uid) ||
            (lobby.user2 == activeUser.uid && lobby.user1 == match.uid)
          );
          if (existingPrivateLobby) {
            console.log("There is an existing game for these two users. Deleting.")
            await remove(databaseRef(database, `private_lobbies/${existingPrivateLobby[0]}`));
          }
        }

        // Create a new private lobby in realtime database
        const privateLobbyRef = databaseRef(database, `private_lobbies`);
        const newPrivateLobbyRef = push(privateLobbyRef, {
          user1: activeUser.uid,
          user2: match.uid,
          game_mode: status,
          course_id: courseId,
          created_at: serverTimestampDB(),
        });
        gameId = newPrivateLobbyRef.key;
        console.log("Creating new game lobby with game-ID: ", gameId);
        console.log("Game mode: ", status);

        // Create a new private chat in firestore
        const privateChatRef = doc(firestore, `private_chats`, gameId);
        await setDoc(privateChatRef, {
          users: [activeUser.uid, match.uid],
          createdAt: serverTimestampFS()
        });

        // Create a new game in firestore
        const gameDataRef = doc(firestore, `game_data`, gameId);
        await setDoc(gameDataRef, {
          player1: {
            uid: activeUser.uid,
            name: activeUser.displayName,
          },
          player2: {
            uid: match.uid,
            name: match.name,
          },
          game_mode: status,
          start_time: serverTimestampFS(),
        });

        // Update status to reflect ongoing game
        console.log("Game-ID:", gameId);
        console.log("Matching user's ID:", match.uid);
        let newStatuses = { ...currentUserStatuses, game_id: gameId, matching_user_id: match.uid };
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
                    <SportsEsportsIcon color='plainBlack' fontSize='large' />
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
                    <QueryStatsIcon color='plainBlack' fontSize='large' />
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
                  <Diversity3Icon color='plainBlack' fontSize='large' />
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
                  <EmojiEventsIcon color='plainBlack' fontSize='large' />
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
        <Grid size={{ xs: 12, sm: 4, md: 3, lg: 3 }}>
          <ActiveCourseDisplay
            activeCourse={activeCourse}
            courseLoading={courseLoading}
            handleChangeCourse={handleChangeCourse}
          />
        </Grid>
        <Grid container size={{ xs: 12, sm: 8, md: 9, lg: 9 }}>
          <Grid size={{ xs: 12, sm: 12, md: 8, lg: 9 }}>
            <Chat chatType="lobby_chats" chatId={courseId} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card sx={{ marginBottom: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" className='normHeadline' gutterBottom>
                  WER IST ONLINE?
                </Typography>
                <List>
                  {users.map((user) => user.statuses.online && (
                    <ListItem key={user.uid}>
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
                            {user.statuses.game_id != null && (
                              <Chip
                                label={"playing"}
                                color={"info"}
                                size="small"
                                style={{ marginRight: 4, textOverflow: "ellipsis" }} />)}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                  {users.length === 1 && (
                    <ListItem>
                      <ListItemText primary="Keine anderen Studierenden online." />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

      </Grid>
    </>
  );
}