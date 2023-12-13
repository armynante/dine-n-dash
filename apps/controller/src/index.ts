import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { DevWorker, verifyToken } from 'diner-utilities';
import cron from 'node-cron';
import db from './db.js';

const app = express();
app.use(express.json());

const WatcherQueue = new DevWorker();

let task:cron.ScheduledTask;

const CRON_STATUS_RUN = 'Running 🏁';
const CRON_STATUS_STOP = 'Stopped 🛑';
let CRON_RUNNING = false;
let CRON_INTERVAL = 15;

const runQueue = async () => {
    task = cron.schedule(`*/${CRON_INTERVAL} * * * * *`, async () => {
        CRON_RUNNING = true;
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
            return task;
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
    CRON_RUNNING = true;
    res.status(200).send('Cron started 🏁');
});

app.post('/stop', verifyToken, (req: Request, res: Response) => {
    task.stop();
    CRON_RUNNING = false;
    res.status(200).send('Cron stopped 🛑');
});

app.get('/status', verifyToken, (req: Request, res: Response) => {
    res.status(200).send({
        status: CRON_RUNNING ? CRON_STATUS_RUN : CRON_STATUS_STOP,
        interval: CRON_INTERVAL,
    });
});

app.post('/setCron', verifyToken, async (req: Request, res: Response) => {
    const { interval, run } = req.body;
    const parsedSeconds = Number(interval);

    CRON_INTERVAL = parsedSeconds;

    if (interval && isNaN(Number(parsedSeconds))) {
        res.status(400).send('Seconds must be a number');
        return;
    }

    if (interval && Number(parsedSeconds) < 1) {
        res.status(400).send('Seconds must be greater than 0');
        return;
    }

    if (interval) {
        console.log(`Received cron interval request: ${parsedSeconds} seconds`);
    }

    if (task) {
        console.log('Stopping existing cron task');
        CRON_RUNNING = false;
        task.stop();
    }

    if (run) {
        await runQueue();
        CRON_RUNNING = true;
    } else {
        task.stop();
        CRON_RUNNING = false;
    }
    res.status(200).send({
        message: `Cron interval set to ${CRON_INTERVAL} seconds and status is ${CRON_RUNNING ? CRON_STATUS_RUN : CRON_STATUS_STOP}`,
        data: {
            status: CRON_RUNNING ? CRON_STATUS_RUN : CRON_STATUS_STOP,
            interval: CRON_INTERVAL,
        }
    }); 
});

app.listen(8000, () => {
    console.log('Server listening on port 8000');
});