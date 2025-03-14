import axios from 'axios';

const pb = axios.create({
    baseURL: 'http://localhost:8000/api', // Remplacez par l'URL de votre API Laravel
    headers: {
        'Content-Type': 'application/json',
    },
});

export default pb;
