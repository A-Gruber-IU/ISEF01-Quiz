import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { NavLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import '@fontsource/source-sans-pro/700.css';
import "./styles.css";

import MenuDrawer from './MenuDrawer';

const ResponsiveLogo = styled('img')(({ theme }) => ({
  height: 'auto',
  width: '90px',
  [theme.breakpoints.up('sm')]: {
    width: '110px',
  },
  [theme.breakpoints.up('md')]: {
    width: '130px',
  },
  [theme.breakpoints.up('lg')]: {
    width: '150px',
  },
}));

export default function TopNav() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" color="primary">
        <Toolbar sx={{ justifyContent: 'space-between', color: "#F6E7F1" }}>
          <ResponsiveLogo src="../images/iu-logo.svg" alt="IU logo" />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right' }}>
            <NavLink className="navlink" to="/">
              <Typography
                variant="h4"
                noWrap
                className='iuHeadline2'
                sx={{
                  fontWeight: 700,
                  marginRight: 3,
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
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