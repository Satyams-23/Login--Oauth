const express = require('express');
const session = require('express-session');
const { OAuth2Client } = require('google-auth-library');
const { google } = require('googleapis');

const app = express();
const PORT = 8000;

const CLIENT_ID = '164586149788-rlpoupm2q9r4mfu6ek7af45burv12s98.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URL = 'http://localhost:8000/api/v1/auth/google/callback';

const oAuth2Client = new OAuth2Client({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    redirectUri: REDIRECT_URL,
});

app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));

app.get('/', (req, res) => {
    try {
        res.send(`
        <h1>YouTube API OAuth</h1>
        <a href="/auth/google">Login with YouTube</a>
    `);
    } catch (error) {
        console.error('Error during token exchange:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Redirect users to the OAuth URL for authorization
app.get('/auth/google', (req, res) => {
    const authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/youtube.readonly',
    });
    res.redirect(authorizeUrl);
});

// Handle the callback after authorization
app.get('/api/v1/auth/google/callback', async (req, res) => {
    try {
        const { code } = req.query;
        const { tokens } = await oAuth2Client.getToken(code);

        // Store the tokens in the session or your database
        req.session.tokens = tokens;

        res.redirect('/profile');
    } catch (error) {
        console.error('Error during token exchange:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Access YouTube API with the stored tokens
app.get('/profile', async (req, res) => {
    try {
        const { tokens } = req.session;
        if (!tokens) {
            res.redirect('/auth/google');
            return;
        }

        oAuth2Client.setCredentials(tokens);

        // Use the tokens to make YouTube API requests
        const { data } = await google.youtube('v3').channels.list({
            auth: oAuth2Client,
            part: 'snippet,statistics', // Include 'snippet' to get channel details
            mine: true,
        });

        const channelSnippet = data.items[0].snippet; // Access snippet object
        const channelStatistics = data.items[0].statistics;

        res.send(`
            <h1>Channel Statistics</h1>
            <p>Channel Name: <h1>${channelSnippet.title}</h1></p>
            <p>Subscribers: ${channelStatistics.subscriberCount}</p>
            <p>Total Views: ${channelStatistics.viewCount}</p>
            <a href="/logout">Logout</a>
        `);

    } catch (error) {
        console.error('Error fetching YouTube data:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));
