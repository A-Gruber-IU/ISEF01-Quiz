import '@fontsource/source-sans-pro/700.css';
import "../Layout/styles.css";

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';


import Lobby from './Lobby';

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
            <Lobby />
        </Box>
    );
}
