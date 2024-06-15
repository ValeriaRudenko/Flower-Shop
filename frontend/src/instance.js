import axios from 'axios';

const axios = axios.create({
    baseURL: 'http://127.0.0.1:5000', // Replace with your IP address or domain
});

export default axios;
