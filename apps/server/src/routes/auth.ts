import db from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Router, Request, Response } from 'express';
import { Email } from 'diner-utilities';

const secretKey = process.env.JWT_SECRET;

if (!secretKey) {
    throw new Error('Missing JWT_SECRET environment variable');
}

const router = Router() as Router;

const EmailClient = new Email();

router.post('/register', async (req: Request, res: Response) => {
    const { email, password, confirm } = req.body;

    console.log('Registering user');
    console.log(email, password);

    try {

        if (!email) {
            throw new Error('Email is required');
        }

        if (!password) {
            throw new Error('Password is required');
        }
        
        if (password !== confirm) {
            throw new Error('Passwords do not match');
        }

        // Generate a salt with a work factor of 10 (higher value = more secure but slower)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const verifyToken = jwt.sign({ email }, secretKey, { expiresIn: '1d' });

        // Save the user to the database
        const { error } = await db
            .client
            .from('user')
            .insert({
                email,
                verifyToken,
                password: hashedPassword,
            })
            .single();

        if (error?.message?.includes('duplicate key value violates unique constraint')) {
            throw new Error('Email already exists');
        }

        // send email 
        await EmailClient.verify(email, verifyToken);
        res.status(201).json({ 
            message: 'Success. Check your email to verify the account',
            data: { token: verifyToken },
        });
    } catch (error) {
        console.error(error);
        const err = error as Error;
        res.status(500).json({
            message: err.message || 'An error occurred while processing the registration request',
        });
    }
});

router.get('/verify', async (req: Request, res: Response) => {
    const { email, token } = req.query;

    console.log('Verifying user');

    try {
        const { data: user, error } = await db
            .client
            .from('user')
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        if (!user) {
            throw new Error('User not found');
        }

        if (user.verifyToken !== token) {
            throw new Error('Invalid token');
        }

        await db
            .client
            .from('user')
            .update({
                verified: true,
                verifyToken: null,
            })
            .eq('email', email);

        res.json({ message: 'User verified successfully' });
    } catch (error) {
        console.error(error);
        const err = error as Error;
        res.status(500).json({
            message: err.message || 'An error occurred while processing the verification request',
        });
    }
});


router.post('/reset-password', async (req: Request, res: Response) => {
    
    console.log('Resetting password');
    
    try {
        const { email } = req.body;
        const user = await db.getUser(email);

        console.log('user', user);
        console.log(!user?.email);
    

        if (!user?.email) {
            throw new Error('No email found');
        }

        const newToken = jwt.sign({ user }, secretKey, { expiresIn: '1d' });
        
        await db
            .client
            .from('user')
            .update({
                resetToken: newToken,
            })
            .eq('email', user.email);
        
        await EmailClient.reset(user.email, newToken);
        
        res.json({ message: 'Password reset email sent. Check you email to reset.' });
    } catch (error) {
        console.error(error);
        const err = error as Error;
        res.status(500).json({
            message: err.message || 'An error occurred while processing the password reset request',
        });
    }
});

router.post('/reset-password/verify', async (req: Request, res: Response) => {
    const { email, token, password, confirmPassword } = req.body;

    console.log('Verifying password reset');

    
    try {
        
        if (!password) {
            throw new Error('Password is required');
        }
    
        if (password !== confirmPassword) {
            throw new Error('Passwords do not match');
        }

        const { data: user, error } = await db
            .client
            .from('user')
            .select('*')
            .eq('email', email)
            .single();
            
        if (error) {
            throw new Error(error.message);
        }

        if (!user) {
            throw new Error('User not found');
        }

        console.log('user.resetToken', user.resetToken);
        console.log('token', token);

        if (user.resetToken !== token) {
            throw new Error('Invalid token');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await db
            .client
            .from('user')
            .update({
                password: hashedPassword,
                resetToken: null,
            })
            .eq('email', email);

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        const err = error as Error;
        res.status(500).json({
            message: err.message || 'An error occurred while processing the password reset request',
        });
    }
});



router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    console.log('Logging in that user');

    try {
        console.log('email to login: ', email, password);
        // Fetch the user's hashed password from the database based on the username
        const { data: user, error:userError } = await db
            .client
            .from('user')
            .select()
            .eq('email', email)
            .single();

        if (userError) {
            throw new Error(userError.message);
        }
            
        if (!user) {
            return res
                .status(401)
                .json({ message: 'No user found' });
        }

        console.log('Got user:', user);
        // Compare the provided password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        console.log('passwordMatch', passwordMatch);
        if (!passwordMatch) {
            return res
                .status(401)
                .json({ message: 'Invalid username or password' });
        }

        console.log('user.verified');
        const token = jwt.sign(user, secretKey, { expiresIn: '365d' });

        // res.set('HX-Redirect', '/dashboard');
        

        res.json({ message: 'Login successful', token, user });
    } catch (error) {
        console.error(error);
        const err = error as Error;
        res.status(500).json({
            error: err.message || 'An error occurred while processing the login request',
        });
    }
});

export default router;