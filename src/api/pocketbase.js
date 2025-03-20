import axios from 'axios';

// Définir la base URL en fonction de l'environnement
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const pb = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

export default pb;
