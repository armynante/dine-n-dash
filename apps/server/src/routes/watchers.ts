// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Request, Response, Router} from 'express';
import { DevWorker, Worker, verifyToken } from 'diner-utilities';
import db from '../db.js';

const router = Router() as Router;

/* 
 * ########################################
 * #######  WORKER INITIALIZATION    ######
 * ########################################
 */


let WatcherQueue: Worker | DevWorker;
if (process.env.NODE_ENV === 'development') {
    console.log('Using dev queue');
    WatcherQueue = new DevWorker();
} else {
    console.log('Using prod queue');
    WatcherQueue = new Worker();   
}

router.get('/testSQS', verifyToken, async (req: Request, res: Response) => {
    try {
        const message = {
            name: 'test',
            message: 'test message',
        };
        const resp = await WatcherQueue.test(message);
        res.status(200).send(resp);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
});

router.get('/purgeSQS', verifyToken, async (req: Request, res: Response) => {
    try {
        const resp = await WatcherQueue.clear();
        res.status(200).send(resp);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
});

router.delete('/clear', verifyToken, async (req: Request, res: Response) => {
    try {
        const { data, error } = await db
            .client
            .from('worker')
            .delete()
            .neq('id', '0');

        if (error) {
            throw error;
        }

        await WatcherQueue.clear();
        console.log('Queue cleared', data);

        res.status(200).send('All Jobs and Requests Cleared');
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
});

// app.get('/testSend', async (req: Request, res: Response) => {


router.post('/', verifyToken, async (req: Request, res: Response) => {
  
    try {
        console.log('Creating watcher');
        const { startTime, endTime, restaurant, partySize, day } = req.body;
        const { token } = req;
        const user = await db.getUser(token.email);

        const { data: upsertedRestaurant, error: upsertedRestaurantError } = await db
            .client
            .from('venue')
            .upsert(
                { 
                    site: 'resy',
                    siteId: restaurant.siteId,
                    name: restaurant.name,
                    city: restaurant.city,
                    neighborhood: restaurant.neighborhood,
                }, { onConflict: 'siteId' }   
            )
            .select()
            .single();

        if (upsertedRestaurantError) {
            throw upsertedRestaurantError;
        }

        const venue = upsertedRestaurant.id;

        const query = {
            startTime,
            endTime,
            venue,
            day,
            partySize,
            user: user as User,
        };
        const { data, error } = await db.client
            .from('worker')
            .insert([{ ...query, user: (user as User).id }])
            .select(`
                *,
                venue (
                    name,
                    site,
                    siteId,
                    neighborhood,
                    city
                ),
                user (
                    *
                )
            `)
            .single();

        if (error) {
            console.log('error inserting watcher');
            throw error;
        }
                        
        res.status(201).json({
            message: 'Watcher created successfully',
            data
        });

    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
});

router.get('/', verifyToken, async (req: Request, res: Response) => {
    const { token } = req;
    const user = await db.getUser(token.email);
    try {
        const { data, error } = await db
            .client
            .from('worker')
            .select(`
                *,
                venue (
                    name,
                    site,
                    siteId,
                    neighborhood,
                    city
                )
            `)
            .eq('user', user.id);

        if (error) {
            throw error;
        }
        res.status(200).json({
            message: 'Watchers retrieved successfully',
            data,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
});

router.delete('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { token } = req;
        const user = await db.getUser(token.email);
        const { data, error } = await db
            .client
            .from('worker')
            .delete()
            .eq('id', id)
            .eq('user', user.id);

        if (error) {
            throw error;
        }

        console.log(data);

        // const deletedJob = await WatcherQueue.deleteJob(data.jobId);
        res.status(200).send({
            message: 'Watcher removed successfully',
            data,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
});

export default router;