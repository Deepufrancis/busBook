import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { sendOtpEmail } from '../utils/emailService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret';
const NODE_ENV = process.env.NODE_ENV || 'development';

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
const OTP_EXPIRY_MINUTES = 10;

const validatePassword = (password: string) => PASSWORD_REGEX.test(password);
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export const signup = async (req: Request, res: Response) => {
	try {
		const { name, email, password, role } = req.body;
		if (!name || !email || !password) {
			return res.status(400).json({ message: 'All fields are required.' });
		}
		if (!validatePassword(password)) {
			return res.status(400).json({ message: 'Password must be at least 6 characters and include a letter, a number, and a special character.' });
		}

		const existingUser = await User.findOne({ email });
		if (existingUser && existingUser.isVerified) {
			return res.status(409).json({ message: 'User already exists.' });
		}

		const otp = generateOtp();
		const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
		const passwordHash = await bcrypt.hash(password, 10);

		if (existingUser && !existingUser.isVerified) {
			existingUser.name = name;
			existingUser.passwordHash = passwordHash;
			existingUser.role = role || 'user';
			existingUser.emailOTP = otp;
			existingUser.emailOTPExpires = otpExpiry;
			await existingUser.save();
		} else {
			const user = new User({
				name,
				email,
				passwordHash,
				role: role || 'user',
				isVerified: false,
				emailOTP: otp,
				emailOTPExpires: otpExpiry
			});
			await user.save();
		}

		await sendOtpEmail(email, name, otp, 'signup');

		return res.status(201).json({ message: 'Signup initiated. Please verify OTP sent to your email.' });
	} catch (error) {
		return res.status(500).json({ message: 'Server error.', error });
	}
};

export const verifySignupOtp = async (req: Request, res: Response) => {
	try {
		const { email, otp } = req.body;
		if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });

		const user = await User.findOne({ email });
		if (!user) return res.status(404).json({ message: 'User not found.' });
		if (!user.emailOTP || !user.emailOTPExpires) return res.status(400).json({ message: 'No OTP found. Please signup again.' });
		if (user.emailOTPExpires < new Date()) return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
		if (user.emailOTP !== otp) return res.status(400).json({ message: 'Invalid OTP.' });

		user.isVerified = true;
		user.emailOTP = undefined;
		user.emailOTPExpires = undefined;
		await user.save();

		return res.status(200).json({ message: 'Email verified successfully.' });
	} catch (error) {
		return res.status(500).json({ message: 'Server error.', error });
	}
};

export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({ message: 'Email and password are required.' });
		}

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({ message: 'Invalid credentials.' });
		}
		if (!user.isVerified) {
			return res.status(403).json({ message: 'Email not verified. Please verify your account first.' });
		}

		const isMatch = await bcrypt.compare(password, user.passwordHash);
		if (!isMatch) {
			return res.status(401).json({ message: 'Invalid credentials.' });
		}

		const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });
		const refreshToken = jwt.sign({ userId: user._id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000
		});

		return res.status(200).json({
			token,
			user: { id: user._id, name: user.name, email: user.email, role: user.role }
		});
	} catch (error) {
		return res.status(500).json({ message: 'Server error.', error });
	}
};

/**
 * Refresh the access token using the refresh token from cookie
 */
export const refreshToken = async (req: Request, res: Response) => {
	try {
		const refreshToken = req.cookies.refreshToken;
		
		if (!refreshToken) {
			return res.status(401).json({ message: 'Refresh token not found.' });
		}

		jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err: any, decoded: any) => {
			if (err) {
				return res.status(403).json({ message: 'Invalid refresh token.' });
			}

			const token = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: '15m' });
			return res.status(200).json({ token });
		});
	} catch (error) {
		return res.status(500).json({ message: 'Server error.', error });
	}
};

/**
 * Logout user and clear refresh token cookie
 */
export const logout = async (req: Request, res: Response) => {
	try {
		res.clearCookie('refreshToken', {
			httpOnly: true,
			secure: NODE_ENV === 'production',
			sameSite: 'strict'
		});
		return res.status(200).json({ message: 'Logged out successfully.' });
	} catch (error) {
		return res.status(500).json({ message: 'Server error.', error });
	}
};

export const getProfile = async (req: Request, res: Response) => {
	try {
		// Assuming req.user is set by auth middleware
		const userId = (req as any).user?.userId;
		if (!userId) {
			return res.status(401).json({ message: 'Unauthorized.' });
		}
		const user = await User.findById(userId).select('-passwordHash');
		if (!user) {
			return res.status(404).json({ message: 'User not found.' });
		}
		return res.status(200).json({ user });
	} catch (error) {
		return res.status(500).json({ message: 'Server error.', error });
	}
};

/**
 * Forgot password - request OTP
 */
export const requestPasswordReset = async (req: Request, res: Response) => {
	try {
		const { email } = req.body;
		if (!email) return res.status(400).json({ message: 'Email is required.' });

		const user = await User.findOne({ email });
		if (!user) return res.status(404).json({ message: 'User not found.' });

		const otp = generateOtp();
		const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
		user.resetOTP = otp;
		user.resetOTPExpires = otpExpiry;
		await user.save();

		await sendOtpEmail(email, user.name, otp, 'reset');
		return res.status(200).json({ message: 'Reset OTP sent to your email.' });
	} catch (error) {
		return res.status(500).json({ message: 'Server error.', error });
	}
};

/**
 * Forgot password - verify OTP and set new password
 */
export const resetPasswordWithOtp = async (req: Request, res: Response) => {
	try {
		const { email, otp, newPassword } = req.body;
		if (!email || !otp || !newPassword) return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
		if (!validatePassword(newPassword)) {
			return res.status(400).json({ message: 'Password must be at least 6 characters and include a letter, a number, and a special character.' });
		}

		const user = await User.findOne({ email });
		if (!user) return res.status(404).json({ message: 'User not found.' });
		if (!user.resetOTP || !user.resetOTPExpires) return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
		if (user.resetOTPExpires < new Date()) return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
		if (user.resetOTP !== otp) return res.status(400).json({ message: 'Invalid OTP.' });

		user.passwordHash = await bcrypt.hash(newPassword, 10);
		user.resetOTP = undefined;
		user.resetOTPExpires = undefined;
		user.isVerified = true; // ensure verified after reset
		await user.save();

		return res.status(200).json({ message: 'Password reset successful. You can now login.' });
	} catch (error) {
		return res.status(500).json({ message: 'Server error.', error });
	}
};
