import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import "@fontsource/kalam";

import MenuDrawer from './MenuDrawer';

export default function TopNav() {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <MenuDrawer />
                        <Typography
                            variant="h4"
                            noWrap
                            component="a"
                            sx={{
                                mx: 1,
                                display: { xs: 'none', md: 'flex' },
                                fontFamily: 'kalam',
                                fontWeight: 700,
                                letterSpacing: '.2rem',
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                        >
                            QuizApp
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right' }}>
                        <img src="../images/iu-logo.svg" alt="IU logo" style={{ height: '40%', width: '40%' }} />
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>
    );
}
