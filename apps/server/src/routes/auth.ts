// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Router, Request, Response } from 'express';
import db from '../db.js';
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET;

if (!secretKey) {
    throw new Error('Missing JWT_SECRET environment variable');
}

const router = Router() as Router;


router.post('/register', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    console.log('Registering user');
    console.log(email, password);

    try {
        // Generate a salt with a work factor of 10 (higher value = more secure but slower)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Save the user to the database
        const { data: user, error } = await db
            .from('user')
            .insert({
                email,
                password: hashedPassword,
            })
            .single();

        if (error) {
            throw new Error(error.message);
        }
        // send email 
        await sendWelcomeEmail(email);
        res.json({ message: 'User registered successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'An error occurred while registering the user',
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