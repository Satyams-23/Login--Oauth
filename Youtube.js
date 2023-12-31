import express from 'express';
import session from 'express-session';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';


const app = express();
const PORT = 3000;

const CLIENT_ID = '164586149788-0djr21idnpfvhgerc379r9b0ggai3eao.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URL = 'http://localhost:3000/auth/callback';

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
        <a href="/auth">Login with YouTube</a>
    `)
    } catch (error) {
        console.error('Error during token exchange:', error);
        res.status(500).send('Internal Server Error');
    }
})

// Redirect users to the OAuth URL for authorization
app.get('/auth', (req, res) => {
    const authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/youtube.readonly',
    });
    res.redirect(authorizeUrl);
});

// Handle the callback after authorization
app.get('/auth/callback', async (req, res) => {
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
            res.redirect('/auth');
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
