import { DevWorker } from 'diner-utilities';
import { runWorker } from './worker.js';
import dotenv from 'dotenv';

dotenv.config();

// Set up dev environment
console.log('Running Worker'); 
const worker = new DevWorker();
    
worker.queue.process(async (job) => {
    console.log('Watcher job running');
    await runWorker(job.data.message, job.data.id, worker);
});
    

worker.queue.on('failed', async (job) => {
    console.log('Watcher job failed');
    console.log(job);
});
