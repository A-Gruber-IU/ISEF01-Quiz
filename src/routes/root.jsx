import { Outlet, useNavigation } from 'react-router-dom';
import { Container } from '@mui/material';
import BottomNav from '../Layout/BottomNav';
import TopNav from '../Layout/TopNav';

export default function Root() {

    const navigation = useNavigation();

    return (
        <>
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
        </>
    );
}