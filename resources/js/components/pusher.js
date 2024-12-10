import Pusher from 'pusher-js';

const pusher = new Pusher("de2033bbba1180bf7323", {
    cluster: "ap1",
    authEndpoint: '/broadcasting/auth', // Enable private channels
    auth: {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    },
});

export default pusher;