import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { DevWorker, Worker, verifyToken } from 'diner-utilities';
import cron from 'node-cron';
import db from './db.js';

const app = express();
app.use(express.json());

let WatcherQueue:Worker | DevWorker;

if (process.env.NODE_ENV === 'development') {
    console.log('Using dev queue');
    WatcherQueue = new DevWorker();
} else {
    console.log('Using prod queue');
    WatcherQueue = new Worker();
}

let task:cron.ScheduledTask;
let CRON_STATUS = 'stopped 🛑';

const runQueue = async (seconds?:number) => {
    CRON_STATUS = 'running 🏁';
    task = cron.schedule(`*/${seconds || 15} * * * * *`, async () => {
        try {
            const { data:workers, error } = await db
                .client
                .from('worker')
                .select(`
                    *,
                    user ( * ),
                    venue ( * )
              `)
                .eq('complete', false);

            console.log(`Found ${workers.length} workers`);

            if (error) {
                console.error('Error:', error); // Note: I've changed console.log to console.error for better visibility
                throw error;
            }

            const messages = workers.map((worker:Worker) => {
                return {
                    id: uuidv4(),
                    message: worker,
                    delay: 0,
                };
            });

            console.log(`Sending ${messages.length} messages to queue`);
            await WatcherQueue.sendBatch(messages);
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    });
};

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

app.post('/start', verifyToken, async (req: Request, res: Response) => {
    await runQueue();
    res.status(200).send('Cron started 🏁');
});

app.post('/stop', verifyToken, (req: Request, res: Response) => {
    task.stop();
    CRON_STATUS = 'stopped 🛑';
    res.status(200).send('Cron stopped 🛑');
});

app.get('/status', verifyToken, (req: Request, res: Response) => {
    res.status(200).send(CRON_STATUS);
});


app.post('/setCron', verifyToken, async (req: Request, res: Response) => {
    const { schedule } = req.body;
    const parsedSeconds = Number(schedule);

    console.log(req.body);

    if (!parsedSeconds) {
        res.status(400).send('No seconds provided');
        return;
    }

    if (isNaN(Number(parsedSeconds))) {
        res.status(400).send('Seconds must be a number');
        return;
    }

    if (Number(parsedSeconds) < 1) {
        res.status(400).send('Seconds must be greater than 0');
        return;
    }

    console.log(`Received cron interval request: ${parsedSeconds} seconds`);

    if (task) {
        console.log('Stopping existing cron task');
        task.stop();
    }

    await runQueue(parsedSeconds);
    res.status(200).send(`Cron interval set to ${parsedSeconds} seconds`);
});

app.listen(8000, () => {
    console.log('Server listening on port 8000');
});