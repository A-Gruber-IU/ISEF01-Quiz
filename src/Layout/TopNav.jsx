import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { NavLink } from 'react-router-dom';
import '@fontsource/source-sans-pro/700.css';
import "./styles.css";

import MenuDrawer from './MenuDrawer';

export default function TopNav() {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="fixed" color="primary" >
                <Toolbar sx={{ justifyContent: 'space-between', color: "#F6E7F1" }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
                        <img src="../images/iu-logo.svg" alt="IU logo" style={{ height: '35%', width: '35%' }} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right' }}>
                        <NavLink className="navlink" to={"/"}>
                            <Typography
                                variant="h4"
                                noWrap
                                component="a"
                                className='iuHeadline2'
                                sx={{
                                    fontWeight: 700,
                                    marginRight: 5,
                                }}
                            >
                                QUIZ APP
                            </Typography>
                        </NavLink>
                        <MenuDrawer />
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>
    );
}
