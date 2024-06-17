import originalAxios from 'axios';

const axios = originalAxios.create({
    baseURL: 'http://193.219.91.103:12868', // Replace with your IP address or domain
});

export default axios;
