// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Request, Response, Router} from 'express';
import { DevWorker, Worker, verifyToken } from 'diner-utilities';
import db from '../db';
import { User } from 'diner-utilities/types';

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

router.get('/testSQS', async (req: Request, res: Response) => {
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

router.get('/purgeSQS', async (req: Request, res: Response) => {
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
        const { startTime, endTime, venue, partySize, day } = req.body;
        const { token: user } = req;
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
            id,
            day,
            partySize,
            tries,
            failed,
            complete,
            jobId,
            jobError,
            venue,
            user (
                id,
                phoneNumber,
                resyId,
                resyToken,
                resyRefreshToken,
                resyEmail,
                resyPaymentMethodId,
                resyGuestId,
                email
            )
                `)
            .single();

        if (error) {
            console.log('error inserting watcher');
            throw error;
        }

        await WatcherQueue.add({ ...data });

        res.status(201).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
});

router.get('/list', verifyToken, async (req: Request, res: Response) => {
    try {
        const { data, error } = await db
            .client
            .from('worker')
            .select();

        if (error) {
            throw error;
        }

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
});

router.delete('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { data, error } = await db
            .client
            .from('worker')
            .select()
            .eq('id', id)
            .single();

        if (error) {
            throw error;
        }

        const deletedJob = await WatcherQueue.deleteJob(data.jobId);
        
        if (deletedJob) {
            console.log('Watcher job removed');

            const { error: workerError } = await db
                .client
                .from('worker')
                .delete()
                .eq('id', id);

            if (workerError) {
                throw workerError;
            }

            console.log('Watcher removed');
            res.status(200).send('Watcher Job removed');
        } else {
            console.log('Watcher not found', data);
            res.status(400).send('Watcher not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
});

export default router;