import { Router } from 'express';
import db from '../db.js';
import { verifyToken } from 'diner-utilities';

const router = Router() as Router;


router.get('/', verifyToken, async (req, res) => {
    try {
        const { token } = req;
        console.log('Getting user');
        const id = token?.id;
        console.log(id);
        const { data, error } = await db.client.from('user').select('*').eq('id', id).single();
        
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
        const id = token?.id;
        const { data, error } = await db.client.from('user').update(req.body).eq('id', id).single();

        if (error) {
            throw error;
        }

        
        res.status(200).json({
            message: 'User updated successfully',
            user: {
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