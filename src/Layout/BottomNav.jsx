import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import SchoolIcon from '@mui/icons-material/School';
import PolicyIcon from '@mui/icons-material/Policy';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Link, NavLink } from 'react-router-dom';
import { Button, IconButton, Stack } from '@mui/material';
import Grid from '@mui/material/Grid2';

export default function BottomNav() {

  const bottomNavItems = [
    {
      route: "impressum",
      label: "Impressum",
      icon: <InfoIcon />
    },
    {
      route: "datenschutz",
      label: "Datenschutz",
      icon: <PolicyIcon />
    },
    {
      route: "faq",
      label: "FAQ",
      icon: <HelpOutlineIcon />
    },
    {
      route: "https://www.iu.de",
      label: "iu.de",
      icon: <SchoolIcon />
    },
  ];


  return (
    <Box sx={{ position: 'relative', bottom: 0, flexGrow: 1, width: "100%", justifyContent: "center", paddingTop: 3, paddingBottom: 3 }}>
      <Grid container>
        <Grid size="grow"></Grid>
        <Grid size={{ xs: 10, sm: 8, md: 6, lg: 4, xl: 3 }}>
          <Grid container spacing={2}>
            {bottomNavItems.map((item) => (
              <Grid key={item.route} justifyContent="space-evenly" alignItems="center" size="grow">
                <NavLink className="bottomNavLink" to={item.route}>
                  <Stack>
                    <IconButton aria-label={item.label}>
                      {item.icon}
                    </IconButton>
                    <div className='smallDenseText'>{item.label}</div>
                  </Stack>
                </NavLink>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid size="grow"></Grid>
      </Grid>
    </Box>
  );
}