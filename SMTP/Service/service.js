// services/authService.js

const User = require('../model/User');
const bcrypt = require('bcrypt');
const otpgenerate = require('../utils/generateOTP');
const jwtHelpers = require('../helpers/jwt.Helpers');
const config = require('../config/index');
const { Secret } = require('jsonwebtoken');
const sendEmail = require('../helpers/sendEmail');
const jwt = require('jsonwebtoken');


const passwordHash = async (password) => {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (err) {
        console.log(err.message);
        throw new Error('Error hashing password');
    }
};

const registerUser = async (user: IAuth) => {
    const { username, email, password, role } = user;
    // Check if the email is already registered
    const existingUser = await User.findOne({ email: email, role: role });
    if (existingUser) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Email is already registered',
        );

        // Generate OTP
    } else {
        const OTP = otpgenerate.generateOTP();

        // Store the user data in a temporary object
        const tempUser = new User({
            username: username,
            email: email,
            password: password, // Store the password temporarily, you should hash it before saving in the database
            otp: OTP,
            role: role,
            passwordChangeAt: Date.now(),
        });

        return { tempUser, OTP };
    }
};

const verifyEmail = async ({ email, username, password, OTP }) => {
    try {
        // Check if the entered OTP is correct
        if (OTP !== OTP) {
            throw new Error('Invalid OTP');
        }

        // If OTP is correct, create a new user in the database
        const encryptpassword = await passwordHash(password);
        const user = new User({
            username: username,
            email: email,
            password: encryptpassword,
            otp: OTP,
            role: userRole,
            passwordChangeAt: Date.now(),
        });

        // Save the user in the database
        const accessToken = jwtHelpers.createToken(
            { userId: _id, email, role: userRole },
            config.jwt.secret as Secret,
            config.jwt.expires_in as string,
        );

        const savedUser = await user.save();

        return { user: savedUser, accessToken };
    } catch (err) {
        console.log(err.message);
        throw new Error('Error verifying email');
    }
};



const loginEmailUser = async (payload: <IAuth) => {
    const { email, password, role } = payload;

    // Check if the user exists with the provided email and role
    const user = await User.findOne({ email, role });

    if (!user) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');
    }

    if (password !== undefined && user.password !== undefined) {
        // Verify the password
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid password');
        }

        // Generate JWT token for the user
        const accessToken = jwtHelpers.createToken(
            { userId: user._id, email, role },
            config.jwt.secret as Secret,
            config.jwt.expires_in as string,
        );

        return { user, accessToken };
    } else {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid password or user data');
    }
};


const forgotPassword = async ({ email }) => {
    try {
        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error('User not found');
        }

        // Generate OTP
        const OTP = otpgenerate.generateOTP();

        // Save OTP in the user document
        user.otp = OTP;
        user.otpExpiration = Date.now() + 60 * 1000; // Set OTP expiration time (e.g., 1 minute)
        await user.save();

        // Send email with OTP for password reset
        const resetMessage = `Your password reset OTP is: ${OTP}`;
        // Replace with your email sending logic
        await sendEmail(email, 'Verification Reset Password Code', resetMessage);

        return user;
    } catch (err) {
        console.log(err.message);
        throw new Error('Error sending password reset OTP');
    }
};

const resetPassword = async ({ email, OTP, newPassword, confirmPassword }) => {
    try {
        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error('User not found');
        }

        // Check if the entered OTP is correct and not expired
        if (user.otp !== OTP || user.otpExpiration < Date.now()) {
            throw new Error('Invalid or expired OTP');
        }

        // Validate new password and confirm password
        if (newPassword !== confirmPassword) {
            throw new Error('New password and confirm password do not match');
        }

        // Hash the new password
        const hashedPassword = await passwordHash(newPassword);

        // Update user's password and clear OTP fields
        user.password = hashedPassword;
        user.otp = undefined;
        user.otpExpiration = undefined;
        await user.save();

        return user;
    } catch (err) {
        console.log(err.message);
        throw new Error('Error resetting password');
    }
};



// Add more service functions as needed

module.exports = {
    registerUser,
    verifyEmail,
    loginUser,
    forgotPassword,
    resetPassword,


    // Add more exported functions
};


