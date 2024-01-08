import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import Twit from 'twit';

const app = express();
const PORT = 3000;

app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

const apiKey = '41H0812HCdtV0qZTkFZNyD6Bs';
const apiSecretKey = 'lOxU7E0MSxbmvv5wy57VLEtt5IK6BpnB79Bqt0IqyK9Sxapkd1';
const callbackURL = 'http://localhost:3000/auth/twitter/callback';

const twit = new Twit({
    consumer_key: apiKey,
    consumer_secret: apiSecretKey,
    app_only_auth: true,
    version: '2', // Set the Twitter API version
});

passport.use(new TwitterStrategy({
    consumerKey: apiKey,
    consumerSecret: apiSecretKey,
    callbackURL: 'oob',
},
    (token, tokenSecret, profile, done) => {
        // In a real application, you would save the user to the database here
        return done(null, { profile, tokens: { token, tokenSecret } });
    }
));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});
passport.use(new TwitterStrategy({
    consumerKey: apiKey,
    consumerSecret: apiSecretKey,
    callbackURL: callbackURL,
}, (token, tokenSecret, profile, done) => {
    // In a real application, you would save the user to the database here
    return done(null, { profile, tokens: { token, tokenSecret } });
}));

app.get('/', (req, res) => res.send(`<h1>Home</h1><a href="/auth/twitter">Login with Twitter</a>`));

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback',
    passport.authenticate('twitter', { failureRedirect: '/' }),
    (req, res) => {
        // Redirect to the profile page after authentication
        res.redirect('/profile');
    });

app.get('/profile', (req, res) => {
    if (req.isAuthenticated()) {
        const userId = req.user.profile.id;

        // Get user details using v2 endpoint
        twit.get('users/by', { id: userId })
            .then(userResponse => {
                const userDetails = userResponse.data;
                console.log('User Details:', userDetails);

                // Display user details on the profile page
                res.send(`
                    <h1>Hello ${userDetails.data.name}!</h1>
                    <p>Followers Count: ${userDetails.data.public_metrics.followers_count}</p>
                    <a href="/logout">Logout</a>
                `);
            })
            .catch(error => {
                console.error('Error fetching user details:', error);
                res.status(500).send('Internal Server Error');
            });
    } else {
        res.redirect('/');
    }
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));
