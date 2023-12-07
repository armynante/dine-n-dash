import { Router } from 'express';
import db from '../db.js';
import { verifyToken } from 'diner-utilities';
import { Types } from 'diner-utilities';

const router = Router() as Router;


router.get('/', verifyToken, async (req, res) => {
    try {
        const { token } = req;
        const user = await db.getUser(token?.email);
        const { data, error } = await db.client.from('user').select('*').eq('id', user.id).single();
        
        if (error) {
            throw error;
        }

        console.log('User found');
        console.log(data);

        res.status(200).json({
            user: {
                ...data,
                password: undefined,
            },
        });
    } catch (error) {
        console.error('error');
        res.status(500).json(error);
    }
});

router.put('/', verifyToken, async (req, res) => {
    console.log('Updating user');
    try {
        const { token } = req;
        const user = await db.getUser(token?.email);
        const { data, error } = await db
            .client
            .from('user')
            .update(req.body)
            .eq('id', user.id)
            .select()
            .single() as unknown as { data: Types.User, error: Error };

        if (error) {
            throw error;
        }

        console.log(data);

        res.status(200).json({
            message: 'User updated successfully',
            data: {
                ...data,
                password: undefined,
            },
        });

    } catch (error) {
        console.error(error);
        const err = error as Error;
        res.status(500).json({
            message: err.message || 'An error occurred while updating the user',
        });
    }
});

export default router;