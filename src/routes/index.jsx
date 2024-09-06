import { NavLink } from 'react-router-dom';

import "../Layout/layout.css";

import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import HomeIcon from '@mui/icons-material/Home';
import Diversity3Icon from '@mui/icons-material/Diversity3';

export default function Index() {

    return (
        <Box sx={{ flexGrow: 1 }}>
            <p>Willkommen auf der Startseite!</p><Grid container spacing={2}>
                <Grid size={{ xs: 4, md: 3 }}>
                    <Paper>
                        <Box>
                            <Stack sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <NavLink className="navlink" to={"single"}>
                                    <SportsEsportsIcon fontSize='large' />

                                </NavLink>
                                <NavLink className="navlink" to={"single"}>
                                    <p>
                                        Einzelspieler-Modus
                                    </p>
                                </NavLink>
                            </Stack>
                        </Box>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 4, md: 3 }}>
                    <Paper>
                        <Box>
                            <Stack sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <NavLink className="navlink" to={"single"}>
                                    <Diversity3Icon fontSize='large' />

                                </NavLink>
                                <NavLink className="navlink" to={"single"}>
                                    <p>
                                        Coop-Modus
                                    </p>
                                </NavLink>
                            </Stack>
                        </Box>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 4, md: 3 }}>
                    <Paper>
                        <Box>
                            <Stack sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <NavLink className="navlink" to={"single"}>
                                    <EmojiEventsIcon fontSize='large' />

                                </NavLink>
                                <NavLink className="navlink" to={"single"}>
                                    <p>
                                        Competititon-Modus
                                    </p>
                                </NavLink>
                            </Stack>
                        </Box>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 4, md: 3 }}>
                    <Paper>
                        <Box>
                            <Stack sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <NavLink className="navlink" to={"single"}>
                                    <QueryStatsIcon fontSize='large' />

                                </NavLink>
                                <NavLink className="navlink" to={"single"}>
                                    <p>
                                        Dashboard
                                    </p>
                                </NavLink>
                            </Stack>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}