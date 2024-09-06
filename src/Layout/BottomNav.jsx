import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import SchoolIcon from '@mui/icons-material/School';
import PolicyIcon from '@mui/icons-material/Policy';

export default function BottomNav() {

  return (
    <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, pb: 1 }}>
      <BottomNavigation
        showLabels
      >
        <BottomNavigationAction label="Impressum" icon={<PolicyIcon />} href='/impressum' />
        <BottomNavigationAction label="IU.de" icon={<SchoolIcon />} href='https://www.iu.de' />
      </BottomNavigation>
    </Box>
  );
}