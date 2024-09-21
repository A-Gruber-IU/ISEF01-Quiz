import { NavLink } from 'react-router-dom';

import { ActiveCourseDisplay } from './ActiveCourseDisplay';
import { useActiveCourse } from './useActiveCourse';

import '@fontsource/source-sans-pro/700.css';
import "../Layout/styles.css";

import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import Diversity3Icon from '@mui/icons-material/Diversity3';

import { useFirebase } from '../useFirebase';
import Lobby from './Lobby';

export default function Index() {

    const { auth } = useFirebase();
    const activeUser = auth.currentUser;
    const { activeCourse, loading, updateActiveCourse } = useActiveCourse(activeUser.uid);

    function handleChangeCourse(courseId) {
        updateActiveCourse(courseId);
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Typography
                variant="h4"
                noWrap
                className='iuHeadline1'
                sx={{
                    fontWeight: 700,
                    marginTop: 2,
                }}
            >
                LERNEN.
            </Typography>
            <br />
            <Typography
                variant="h4"
                noWrap
                className='iuHeadline1'
                sx={{
                    fontWeight: 700,
                    marginBottom: 2,
                }}
            >
                AUF MEINE ART.
            </Typography>
            <Grid container spacing={2}>
                <Grid container>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper elevation={8} sx={{ py: 2, px: 2, textAlign: "center" }}>
                            <Box>
                                <Stack sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <NavLink className="navlink" to={"single"}>
                                        <SportsEsportsIcon fontSize='large' />

                                    </NavLink>
                                    <NavLink className="navlink" to={"single"}>
                                        <h3 className='normHeadline'>Singleplayer-Modus</h3>
                                    </NavLink>
                                </Stack>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper elevation={8} sx={{ py: 2, px: 2, textAlign: "center" }}>
                            <Box>
                                <Stack sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <NavLink className="navlink" to={"dashboard"}>
                                        <QueryStatsIcon fontSize='large' />

                                    </NavLink>
                                    <NavLink className="navlink" to={"dashboard"}>
                                        <h3 className='normHeadline'>Dashboard</h3>
                                    </NavLink>
                                </Stack>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper elevation={8} sx={{ py: 2, px: 2, textAlign: "center" }}>
                            <Box>
                                <Stack sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <NavLink className="navlink" to={"coop"}>
                                        <Diversity3Icon fontSize='large' />

                                    </NavLink>
                                    <NavLink className="navlink" to={"coop"}>
                                        <h3 className='normHeadline'>Coop-Modus</h3>
                                    </NavLink>
                                </Stack>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper elevation={8} sx={{ py: 2, px: 2, textAlign: "center" }}>
                            <Box>
                                <Stack sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <NavLink className="navlink" to={"competition"}>
                                        <EmojiEventsIcon fontSize='large' />

                                    </NavLink>
                                    <NavLink className="navlink" to={"competition"}>
                                        <h3 className='normHeadline'>Competition-Modus</h3>
                                    </NavLink>
                                </Stack>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Grid>
            <Grid container spacing={4} marginTop={3}>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <ActiveCourseDisplay
                        activeCourse={activeCourse}
                        loading={loading}
                        handleChangeCourse={handleChangeCourse}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6}}>
                    <Lobby activeCourse={activeCourse} />
                </Grid>
            </Grid>
        </Box>
    );
}
