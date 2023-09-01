
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Request, Response, Router } from 'express';
import db from '../db';
import { verifyToken } from 'diner-utilities';

const router = Router() as unknown as Router;

router.get('/', verifyToken, async (req: Request, res: Response) => {
    try {
        const { data, error } = await db.from('favorites').select();

        if (error) {
            throw error;
        }

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
});

router.post('/', verifyToken, async (req: Request, res: Response) => {
    console.log('Creating favorite');
    try {
        const { name, site, siteData } = req.body;
        const { data, error } = await db
            .from('favorites')
            .insert([{ name, site, siteData }])
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.status(201).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
});

export default router;