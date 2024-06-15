import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://your-ip-address-or-domain/api', // Replace with your IP address or domain
});

export default instance;
