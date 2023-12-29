import { google } from 'googleapis';
import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import { OAuth2Client } from 'google-auth-library';

const app = express();

const CLIENT_ID = '164586149788-0djr21idnpfvhgerc379r9b0ggai3eao.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URL = 'https://login-oauth.vercel.app/auth/callback';

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    session({
        secret: 'your-secret-key',
        resave: true,
        saveUninitialized: true,
    })
);

app.get('/auth', (req, res) => {
    const authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/userinfo.profile',
    });
    res.redirect(authorizeUrl);
});

app.get('/auth/callback', async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            console.error('Authorization Code is missing.');
            res.status(400).send('Bad Request');
            return;
        }

        console.log('Authorization Code:', code);
        const { tokens } = await oAuth2Client.getToken(code);

        // You can store the tokens in the session or in your database
        req.session.tokens = tokens;

        res.redirect('/profile');
    } catch (error) {
        console.error('Error during token exchange:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/profile', async (req, res) => {
    const { tokens } = req.session;
    if (!tokens) {
        res.redirect('/auth');
        return;
    }

    oAuth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oAuth2Client });
    const { data } = await oauth2.userinfo.get();

    res.send(`
    <h1>Hello ${data.name}!</h1>
    <img src="${data.picture}" alt="Profile Picture">
    <a href="/logout">Logout</a>
  `);
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
