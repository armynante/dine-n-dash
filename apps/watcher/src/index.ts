import { SQSEvent } from 'aws-lambda';
import { DevWorker, Types, Worker } from 'diner-utilities';
import { runWorker } from './worker.js';
import { Watcher } from 'diner-utilities/src/types.js';

export const handler = async (event: SQSEvent): Promise<void> => {
    const { receiptHandle, body } = event.Records[0] as unknown as { receiptHandle: string, body: string };
    const watcherConfig = JSON.parse(body) as Types.Watcher;
    
    const worker = new Worker();

    await runWorker(watcherConfig, receiptHandle, worker);
};

// Set up dev environment

if (process.env.NODE_ENV === 'development') {    
    const worker = new DevWorker();
    
    worker.queue.process(async (job) => {
        await runWorker(job.data as Watcher, 'test', worker);
    });

    worker.queue.on('failed', async (job) => {
        console.log('DEV watcher job failed');
        console.log(job);
    });
}