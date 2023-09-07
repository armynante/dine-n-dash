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
    const { email, password } = req.body;

    console.log('Registering user');
    console.log(email, password);

    try {
        // Generate a salt with a work factor of 10 (higher value = more secure but slower)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const verifyToken = jwt.sign({ email }, secretKey, { expiresIn: '1d' });

        // Save the user to the database
        const { data: user, error } = await db
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
        res.json({ message: 'User registered successfully', user });
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


router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    console.log('Logging in user');

    try {
        // Fetch the user's hashed password from the database based on the username
        const { data: user } = await db
            .client
            .from('user')
            .select()
            .eq('email', email)
            .single();

        if (!user) {
            return res
                .status(401)
                .json({ message: 'Invalid username or password' });
        }
        // Compare the provided password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res
                .status(401)
                .json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign(user, secretKey, { expiresIn: '365d' });

        res.json({ message: 'Login successful', token, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'An error occurred while processing the login request',
        });
    }
});

export default router;