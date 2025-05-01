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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Admin = () => {
    const [vehicles, setVehicles] = useState([]);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user, loading, isAdmin } = useContext(AuthContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vehiclesRes, usersRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/vehicle/all'),
                    axios.get('http://localhost:5000/api/admin/users'),
                ]);
                setVehicles(vehiclesRes.data);
                setUsers(usersRes.data);
            } catch (err) {
                setError(err.response?.data?.msg || 'Failed to fetch data');
            }
        };
        if (user && isAdmin() && !loading) {
            fetchData();
        }
    }, [user, loading, isAdmin]);

    const handleStatusChange = async (vehicleId, status) => {
        try {
            const res = await axios.put(
                'http://localhost:5000/api/vehicle/status',
                { vehicleId, status },
                { headers: { 'X-CSRF-Token': await getCsrfToken() }, withCredentials: true }
            );
            setVehicles(vehicles.map(v => (v._id === vehicleId ? { ...v, status } : v)));
            setError(res.data.msg);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to update status');
        }
    };

    const handleVerificationChange = async (userId, isVerified) => {
        try {
            const res = await axios.put(
                'http://localhost:5000/api/admin/users/verify',
                { userId, isVerified },
                { headers: { 'X-CSRF-Token': await getCsrfToken() }, withCredentials: true }
            );
            setUsers(users.map(u => (u._id === userId ? { ...u, isVerified } : u)));
            setError(res.data.msg);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to update verification');
        }
    };

    const getCsrfToken = async () => {
        const res = await axios.get('http://localhost:5000/api/auth/csrf', { withCredentials: true });
        return res.data.csrfToken;
    };

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

    if (!user || !isAdmin()) {
        navigate('/login');
        return null;
    }

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 5, p: { xs: 2, sm: 0 } }}>
            <Typography variant="h4" gutterBottom>
                Admin Dashboard
            </Typography>
            <Typography variant="h5" gutterBottom>
                All Reported Vehicles
            </Typography>
            <List>
                {vehicles.map((vehicle) => (
                    <ListItem key={vehicle._id} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <ListItemText
                            primary={`Number Plate: ${vehicle.numberPlate}`}
                            secondary={`Color: ${vehicle.color}, Model: ${vehicle.model}, Status: ${vehicle.status}, Reported By: ${vehicle.userId.name}`}
                        />
                        <FormControl sx={{ mt: 1, minWidth: 120 }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={vehicle.status}
                                onChange={(e) => handleStatusChange(vehicle._id, e.target.value)}
                            >
                                <MenuItem value="stolen">Stolen</MenuItem>
                                <MenuItem value="recovered">Recovered</MenuItem>
                            </Select>
                        </FormControl>
                    </ListItem>
                ))}
            </List>
            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                All Users
            </Typography>
            <List>
                {users.map((u) => (
                    <ListItem key={u._id} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <ListItemText
                            primary={`Name: ${u.name}`}
                            secondary={`Email: ${u.email}, Verified: ${u.isVerified ? 'Yes' : 'No'}`}
                        />
                        <FormControl sx={{ mt: 1, minWidth: 120 }}>
                            <InputLabel>Verification</InputLabel>
                            <Select
                                value={u.isVerified}
                                onChange={(e) => handleVerificationChange(u._id, e.target.value)}
                            >
                                <MenuItem value={true}>Verified</MenuItem>
                                <MenuItem value={false}>Unverified</MenuItem>
                            </Select>
                        </FormControl>
                    </ListItem>
                ))}
            </List>
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

export default Admin;