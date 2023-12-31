import express from 'express';
import session from 'express-session';
import axios from 'axios';

const app = express();
const PORT = 3000;

// Instagram API constants
const INSTAGRAM_API_BASE_URL = 'https://graph.instagram.com/v12.0';
const INSTAGRAM_CLIENT_ID = '737605464569028';
const INSTAGRAM_CLIENT_SECRET = 'eb0439ee58e0c7a41197daf72847b278';
const INSTAGRAM_REDIRECT_URL = 'https://influencerapi.vercel.app/auth/instagram-callback';

// Express session setup
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));

app.get('/', (req, res) => {
    res.send(`
        <h1>Instagram API OAuth</h1>
        <a href="/auth/instagram-auth">Login with Instagram</a>
    `);
});

app.get('/auth/instagram-auth', (req, res) => {
    const authorizeUrl = `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_CLIENT_ID}&redirect_uri=${INSTAGRAM_REDIRECT_URL}&scope=user_profile,user_media&response_type=code`;
    res.redirect(authorizeUrl);
});

app.get('/auth/instagram-callback', async (req, res) => {
    try {
        const { code } = req.query;

        const tokenResponse = await axios.post(`https://api.instagram.com/oauth/access_token`, {
            client_id: INSTAGRAM_CLIENT_ID,
            client_secret: INSTAGRAM_CLIENT_SECRET,
            redirect_uri: INSTAGRAM_REDIRECT_URL,
            code,
            grant_type: 'authorization_code',
        });

        const accessToken = tokenResponse.data.access_token;
        req.session.instagramAccessToken = accessToken;

        res.redirect('/profile-instagram');
    } catch (error) {
        console.error('Error during Instagram authorization:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/profile-instagram', async (req, res) => {
    try {
        const accessToken = req.session.instagramAccessToken;

        const userDataResponse = await axios.get(`${INSTAGRAM_API_BASE_URL}/me?fields=id,username&access_token=${accessToken}`);
        const userData = userDataResponse.data;

        res.send(`
      <h1>Instagram User Data</h1>
      <p>Instagram ID: ${userData.id}</p>
      <p>Instagram Username: ${userData.username}</p>
      <a href="/logout">Logout</a>
    `);
    } catch (error) {
        console.error('Error fetching Instagram user data:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));
