const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const cors = require('cors');
const app = express();

app.use(express.json());

// Express session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));
// Middleware to parse JSON in POST requests
app.use(
    cors({
        origin: 'http://localhost:3000', // Your frontend origin
        credentials: true,
    }),
);
// Passport configuration
passport.use(new GoogleStrategy({
    clientID: '164586149788-rlpoupm2q9r4mfu6ek7af45burv12s98.apps.googleusercontent.com',
    clientSecret: "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",
    callbackURL: 'http://localhost:8000/api/v1/auth/google/callback',
},
    (accessToken, refreshToken, profile, done) => {
        // Custom logic to associate the Google profile with the selected role
        // Save user data to database or perform any necessary actions
        const user = {
            id: profile.id,
            displayName: profile.displayName,
            role: req.session.role // Assuming you stored the selected role in the session during role selection
        };
        console.log('User role:', req.session.role);

        return done(null, user);
    }));

// Serialize user to store in the session
passport.serializeUser((user, done) => {
    done(null, user);
});

// Deserialize user from the session
passport.deserializeUser((user, done) => {
    done(null, user);
});

// Routes

// ... (previous code)

// Add a new API endpoint to receive the selected role
app.post('/api/v1/auth/fetchrole', cors(), (req, res) => {
    const role = req.body;

    // Save the selected role in the session
    req.session.role = role;
    console.log('Selected role:', role);

    res.json({ success: true, message: 'Role selected and saved successfully.' });
});

// ... (remaining code)

app.get('/api/v1//auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/api/v1/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // Successful authentication, redirect to the home page or next step
        res.redirect('api/v1/dashboard');
    }
);

app.get('/api/v1/dashboard', (req, res) => {
    // Access user details from req.user
    const user = req.session.user;
    res.json({ user });
});

// Start server
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
