const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 8000;

app.get('/', (req,res) => {
    console.log("hello Guys")
});

// Instagram login route
app.get('/login', (req, res) => {

    // console.log(" <h1>Welcome to Instagram Login App</h1>
    //   < a href = "/login" > Login with Instagram</a > ");
    // Redirect user to Instagram for authentication
    const redirectUri = 'http://localhost:8000/api/v1/auth/google/callback';  // Update this line
    const instagramAuthUrl = `https://api.instagram.com/oauth/authorize/?client_id='1375585080017495'&redirect_uri=${redirectUri}&response_type=code`;
    res.redirect(instagramAuthUrl);
});

// Callback route after Instagram login
app.get('/api/v1/auth/google/callback', async (req, res) => {
    console.log('Callback route reached');


    try {
        // Exchange code for access token
        const { code } = req.query;
        const redirectUri = 'http://localhost:8000/api/v1/auth/google/callback';
        const tokenResponse = await axios.post('https://api.instagram.com/oauth/access_token', {
            client_id: '1375585080017495',
            client_secret: 'f1357bcfa8706e57f7ed4a49008cecba',
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
            code: code,
        });

        // Fetch basic user data using the access token
        const accessToken = tokenResponse.data.access_token;
        const userResponse = await axios.get(`https://graph.instagram.com/v12.0/me?fields=id,username,profile_picture_url&access_token=${accessToken}`);
        const userData = userResponse.data;

        // Display user data
        res.send(`<h1>Hello, ${userData.username}!</h1><img src="${userData.profile_picture_url}" alt="Profile Picture">`);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
