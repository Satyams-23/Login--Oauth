const express = require('express');
const axios = require('axios');
const app = express();

const FACEBOOK_APP_ID = 'your-app-id';
const FACEBOOK_APP_SECRET = 'your-app-secret';
const REDIRECT_URI = 'your-redirect-uri';

app.get('/login/facebook', (req, res) => {
    const loginUrl = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${REDIRECT_URI}&scope=email,user_profile&response_type=code`;
    res.redirect(loginUrl);
});

app.get('/login/facebook/callback', async (req, res) => {
    const code = req.query.code;

    // Exchange code for access token
    const tokenResponse = await axios.get(`https://graph.facebook.com/v12.0/oauth/access_token?client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&code=${code}&redirect_uri=${REDIRECT_URI}`);
    const accessToken = tokenResponse.data.access_token;

    // Use the access token to get user data
    const userDataResponse = await axios.get(`https://graph.facebook.com/v12.0/me?fields=id,name,email&access_token=${accessToken}`);
    const userData = userDataResponse.data;

    // Handle user data as needed
    res.json(userData);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    Twitter.json
});
