import { Outlet, useNavigation } from 'react-router-dom';
import { Container } from '@mui/material';
import BottomNav from '../Layout/BottomNav';
import TopNav from '../Layout/TopNav';

import { createTheme, ThemeProvider } from '@mui/material/styles';

const iuTheme = createTheme({
    palette: {
        primary: {
            main: '#F6F4F5',
        },
        secondary: {
            main: '#55FF4D',
        },
        tertiary: {
            main: '#D9D9DD',
        },
        plainBlack: {
            main: '#010101',
        },
    },
});

export default function Root() {

    const navigation = useNavigation();

    return (
        <ThemeProvider theme={iuTheme}>
            <TopNav />
            <div
                id="mainView"
                className={
                    navigation.state === "loading" ? "loading" : ""
                }
            >
                <Container sx={{ py: 7 }}>
                    <Outlet />
                </Container>
            </div>
            <BottomNav />
        </ThemeProvider>
    );
}