// controllers/authController.js

const authService = require('../Service/service');
const sendResponse = require('../Shared/sendResponse');
const catchAsyncError = require('../middleware/catchAsyncError');
const httpStatus = require('http-status');

// User Register
exports.registerUser = catchAsyncError(async (req, res, next) => {
    const { email, username, password, role } = req.body;
    try {
        const { tempUser, OTP } = await authService.registerUser({
            email,
            username,
            password,
            role,
        });

        // Send verification email with OTP using EmailController
        const verificationMessage = `Your verification code is: ${OTP}`;
        // Replace with your email sending logic
        await sendEmail(email, 'Verification Code', verificationMessage);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'OTP sent successfully to your email address',
            data: tempUser,
        });
    } catch (err) {
        console.log(err.message);
        sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: `${err.message}`,
        });
    }
});

// OTP Verification
exports.verifyEmail = catchAsyncError(async (req, res, next) => {
    const data = req.body;
    try {
        if (!data) {
            throw new ApiError(
                httpStatus.UNAUTHORIZED,
                'Authorization Body is missing',
            );
        }
        const tempUser = req.session.tempUser;
        if (tempUser === undefined) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'UnAuthorized User');
        }
        if (tempUser.email !== email) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invaild Email');
        }
        if (tempUser.password !== password) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invaild Password');
        }

        if (tempUser.role !== data.role) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Role');
        }

        if (tempUser.otp !== data.otp) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invaild OTP');
        }
        const { user, token } = await authService.verifyEmail(data);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'User OTP verify successful and user created',
            data: { user, token },
        });
    } catch (err) {
        sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: `${err.message}`,
        });
    }
});

// // Other authentication functions...

// // Logout
// exports.logout = catchAsyncError(async (req, res, next) => {
//     try {
//         // Your logout logic here
//         res.clearCookie('token');
//         sendResponse(res, {
//             statusCode: httpStatus.OK,
//             success: true,
//             message: 'Logout successful',
//         });
//     } catch (err) {
//         console.log(err.message);
//         sendResponse(res, {
//             statusCode: httpStatus.INTERNAL_SERVER_ERROR,
//             success: false,
//             message: `${err.message}`,
//         });
//     }
// });

// User Login
exports.loginEmailUser = catchAsync(async (req, res, next) => {
    const { email, password, role } = req.body;
    try {
        const { user, token } = await authService.loginUser({
            email,
            password,
            role,
        });

        sendResponse < ILoginUsersResponse > (res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Login successful',
            data: { user, token },
        });
    } catch (err) {
        console.log(err.message);
        sendResponse < ILoginUsersResponse > (res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: `${err.message}`,
        });
    }
});

// Forgot Password
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
    const { email } = req.body;
    try {
        const user = await authService.forgotPassword({ email });

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Password reset OTP sent successfully to your email address',
            data: user,
        });
    } catch (err) {
        console.log(err.message);
        sendResponse(res, {
            statusCode: err.status || httpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: `${err.message}`,
        });
    }
});

// Reset Password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
    const { email, OTP, newPassword, confirmPassword } = req.body;
    try {
        const user = await authService.resetPassword({
            email,
            OTP,
            newPassword,
            confirmPassword,
        });

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Password reset successful',
            data: user,
        });
    } catch (err) {
        console.log(err.message);
        sendResponse(res, {
            statusCode: err.status || httpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: `${err.message}`,
        });
    }
});
