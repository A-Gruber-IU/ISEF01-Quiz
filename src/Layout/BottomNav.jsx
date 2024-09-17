import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import SchoolIcon from '@mui/icons-material/School';
import PolicyIcon from '@mui/icons-material/Policy';
import InfoIcon from '@mui/icons-material/Info';

export default function BottomNav() {

  return (
    <Box sx={{ position: 'relative', bottom: 0, left: 0, right: 0 }}>
      <BottomNavigation
        showLabels
      >
        <BottomNavigationAction label="Impressum" icon={<InfoIcon />} href='/impressum' />
        <BottomNavigationAction label="Datenschutz" icon={<PolicyIcon />} href='/datenschutz' />
        <BottomNavigationAction label="IU.de" icon={<SchoolIcon />} href='https://www.iu.de' />
      </BottomNavigation>
    </Box>
  );
}