import axios from 'axios';

const instance = axios.create({
    // Change this URL if your backend runs on a different port
    baseURL: 'http://localhost:3000/api', 
    headers: {
        'Content-Type': 'application/json',
    },
});

export default instance;