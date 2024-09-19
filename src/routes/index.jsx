import { NavLink } from 'react-router-dom';

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

export default function Index() {

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

                <Grid size={{ xs: 4, md: 3 }}>
                    <Paper elevation={8} sx={{ py: 2, px: 2, textAlign: "center" }}>
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
                <Paper elevation={8} sx={{ py: 2, px: 2, textAlign: "center" }}>
                        <Box>
                            <Stack sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <NavLink className="navlink" to={"coop"}>
                                    <Diversity3Icon fontSize='large' />

                                </NavLink>
                                <NavLink className="navlink" to={"coop"}>
                                    <p>
                                        Coop-Modus
                                    </p>
                                </NavLink>
                            </Stack>
                        </Box>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 4, md: 3 }}>
                <Paper elevation={8} sx={{ py: 2, px: 2, textAlign: "center" }}>
                        <Box>
                            <Stack sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <NavLink className="navlink" to={"competition"}>
                                    <EmojiEventsIcon fontSize='large' />

                                </NavLink>
                                <NavLink className="navlink" to={"competition"}>
                                    <p>
                                        Competition-Modus
                                    </p>
                                </NavLink>
                            </Stack>
                        </Box>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 4, md: 3 }}>
                <Paper elevation={8} sx={{ py: 2, px: 2, textAlign: "center" }}>
                        <Box>
                            <Stack sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <NavLink className="navlink" to={"dashboard"}>
                                    <QueryStatsIcon fontSize='large' />

                                </NavLink>
                                <NavLink className="navlink" to={"dashboard"}>
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
