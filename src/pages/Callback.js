import { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Typography, Box } from '@mui/material';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Callback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useContext(AuthContext);
    const [error, setError] = useState('');

    useEffect(() => {
        console.log('Callback component mounted', location.search);
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const errorParam = params.get('error');

        if (errorParam) {
            console.error('Google auth error:', errorParam);
            setError('Google authentication failed. Please try again.');
            setTimeout(() => navigate('/login'), 3000);
            return;
        }

        if (!token) {
            console.error('No token received in callback');
            setError('No token received. Redirecting to login...');
            setTimeout(() => navigate('/login'), 3000);
            return;
        }

        // Validate token and fetch user data
        const validateAndLogin = async () => {
            try {
                console.log('Validating token:', token);
                login(token, {});
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('User data fetched:', res.data.user);
                login(token, res.data.user);
                navigate('/my-vehicles', { replace: true });
            } catch (err) {
                console.error('Token validation error:', err.response?.data || err.message);
                setError('Invalid token. Redirecting to login...');
                localStorage.removeItem('token');
                setTimeout(() => navigate('/login'), 3000);
            }
        };

        validateAndLogin();
    }, [location, navigate, login]);

    return (
        <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Typography variant="h6">{error ? error : 'Processing Google login...'}</Typography>
        </Box>
    );
};

export default Callback;