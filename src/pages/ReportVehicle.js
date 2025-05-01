import { useState, useContext } from 'react';
import {
    TextField,
    Button,
    Typography,
    Box,
    MenuItem,
    InputLabel,
    FormControl,
    Select,
    Snackbar,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ReportVehicle = () => {
    const [formData, setFormData] = useState({
        numberPlate: '',
        color: '',
        model: '',
        description: '',
        location: { latitude: '', longitude: '' },
    });
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 5) {
            setError('Maximum 5 files allowed');
            return;
        }
        const validFiles = selectedFiles.filter(file =>
            ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type) &&
            file.size <= 5 * 1024 * 1024
        );
        if (validFiles.length !== selectedFiles.length) {
            setError('Only JPEG, PNG, or PDF files under 5MB are allowed');
            return;
        }
        setFiles(validFiles);
    };

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData({
                        ...formData,
                        location: {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        },
                    });
                    setError('');
                },
                (err) => {
                    setError('Failed to get location: ' + err.message);
                }
            );
        } else {
            setError('Geolocation is not supported by this browser.');
        }
    };

    const validateForm = () => {
        if (!formData.numberPlate.match(/^[A-Z]{2}-[0-9]{1,2}-[A-Z]{1,2}-[0-9]{1,4}$/)) {
            setError('Invalid number plate format (e.g., PB-01-AB-1234)');
            return false;
        }
        if (!formData.color) {
            setError('Color is required');
            return false;
        }
        if (!formData.model) {
            setError('Model is required');
            return false;
        }
        if (!formData.location.latitude || !formData.location.longitude) {
            setError('Please allow location access');
            return false;
        }
        return true;
    };

    const getCsrfToken = async () => {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/csrf`, { withCredentials: true });
        return res.data.csrfToken;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const data = new FormData();
        data.append('numberPlate', formData.numberPlate);
        data.append('color', formData.color);
        data.append('model', formData.model);
        data.append('description', formData.description);
        data.append('location', JSON.stringify(formData.location));
        files.forEach(file => data.append('documents', file));

        try {
            const csrfToken = await getCsrfToken();
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/vehicle/report`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-CSRF-Token': csrfToken,
                },
                withCredentials: true,
            });
            setSuccess(res.data.msg);
            setTimeout(() => navigate('/my-vehicles'), 2000);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to report vehicle');
        }
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 5, p: { xs: 2, sm: 0 } }}>
            <Typography variant="h4" gutterBottom>
                Report Stolen Vehicle
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Number Plate (e.g., PB-01-AB-1234)"
                    name="numberPlate"
                    fullWidth
                    margin="normal"
                    onChange={handleChange}
                    inputProps={{ pattern: '[A-Z]{2}-[0-9]{1,2}-[A-Z]{1,2}-[0-9]{1,4}' }}
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel>Color</InputLabel>
                    <Select name="color" value={formData.color} onChange={handleChange}>
                        <MenuItem value="Red">Red</MenuItem>
                        <MenuItem value="Blue">Blue</MenuItem>
                        <MenuItem value="Black">Black</MenuItem>
                        <MenuItem value="White">White</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    label="Model"
                    name="model"
                    fullWidth
                    margin="normal"
                    onChange={handleChange}
                />
                <TextField
                    label="Description"
                    name="description"
                    multiline
                    rows={4}
                    fullWidth
                    margin="normal"
                    onChange={handleChange}
                />
                <Button variant="outlined" onClick={getLocation} sx={{ mt: 2 }}>
                    Get My Location
                </Button>
                <TextField
                    label="Latitude"
                    name="latitude"
                    value={formData.location.latitude}
                    fullWidth
                    margin="normal"
                    disabled
                />
                <TextField
                    label="Longitude"
                    name="longitude"
                    value={formData.location.longitude}
                    fullWidth
                    margin="normal"
                    disabled
                />
                <Typography variant="body2" sx={{ mt: 2 }}>
                    Upload documents (max 5, JPEG/PNG/PDF, 5MB each)
                </Typography>
                <input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    multiple
                    onChange={handleFileChange}
                    style={{ marginTop: '8px' }}
                />
                <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                    Report Vehicle
                </Button>
            </form>
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError('')}
                message={error}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            />
            <Snackbar
                open={!!success}
                autoHideDuration={6000}
                onClose={() => setSuccess('')}
                message={success}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            />
        </Box>
    );
};

export default ReportVehicle;