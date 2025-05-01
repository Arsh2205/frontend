import { useState, useEffect, useContext } from 'react';
import {
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    Button,
    Snackbar,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const MyVehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user, loading } = useContext(AuthContext);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/vehicle/my-vehicles');
                setVehicles(res.data);
            } catch (err) {
                setError(err.response?.data?.msg || 'Failed to fetch vehicles');
            }
        };
        if (user && !loading) {
            fetchVehicles();
        }
    }, [user, loading]);

    if (loading) {
        return (
            <Box sx={{ textAlign: 'center', mt: 5 }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Loading...
                </Typography>
            </Box>
        );
    }

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 5, p: { xs: 2, sm: 0 } }}>
            <Typography variant="h4" gutterBottom>
                My Reported Vehicles
            </Typography>
            <List>
                {vehicles.map((vehicle) => (
                    <ListItem key={vehicle._id} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <ListItemText
                            primary={`Number Plate: ${vehicle.numberPlate}`}
                            secondary={`Color: ${vehicle.color}, Model: ${vehicle.model}, Status: ${vehicle.status}`}
                        />
                        <Accordion sx={{ width: '100%', mt: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>e-Challans</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                {vehicle.eChallans.length > 0 ? (
                                    <List>
                                        {vehicle.eChallans.map((challan, index) => (
                                            <ListItem key={index}>
                                                <ListItemText
                                                    primary={`Violation: ${challan.violation}`}
                                                    secondary={`Date: ${new Date(challan.date).toLocaleDateString()}, Amount: ₹${challan.amount}, Status: ${challan.status}`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                ) : (
                                    <Typography>No e-Challans found</Typography>
                                )}
                            </AccordionDetails>
                        </Accordion>
                        <Accordion sx={{ width: '100%', mt: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>Sightings</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                {vehicle.sightings.length > 0 ? (
                                    <List>
                                        {vehicle.sightings.map((sighting, index) => (
                                            <ListItem key={index}>
                                                <ListItemText
                                                    primary={`Date: ${new Date(sighting.timestamp).toLocaleString()}`}
                                                    secondary={`Location: Latitude ${sighting.location.coordinates[1]}, Longitude ${sighting.location.coordinates[0]}${sighting.cameraId ? `, Camera ID: ${sighting.cameraId}` : ''}`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                ) : (
                                    <Typography>No sightings reported</Typography>
                                )}
                            </AccordionDetails>
                        </Accordion>
                    </ListItem>
                ))}
            </List>
            <Button
                variant="contained"
                onClick={() => navigate('/report-vehicle')}
                sx={{ mt: 2 }}
            >
                Report New Vehicle
            </Button>
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError('')}
                message={error}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            />
        </Box>
    );
};

export default MyVehicles;