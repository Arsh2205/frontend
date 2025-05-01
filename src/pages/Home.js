import { Typography, Box } from '@mui/material';

const Home = () => {
    return (
        <Box sx={{ mt: 5, textAlign: 'center' }}>
            <Typography variant="h2">Stolen Vehicle Tracker</Typography>
            <Typography variant="h6">
                Report and track stolen vehicles with ease.
            </Typography>
        </Box>
    );
};

export default Home;