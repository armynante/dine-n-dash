import { Types } from 'diner-utilities';
import db from './db';
import { Queue } from 'bull';

export const markCompleteIfToday = async (config: Types.Watcher) => {
    if (config.day) {
        const today  =  new Date(config.day) <= new Date();
        if (today) {
            console.log('Watcher past start date');
            await db.from('worker')
                .update({ tries: config.tries, complete: true  })
                .eq('id', config.id)
                .select()
                .single();
            
            return true;
        }
    }
};

export const seatingCheck = async (seatings:Types.SeatingResponse, config: Types.Watcher , watcherQueue:Queue<Types.Watcher>) => {
    if (seatings.availibleSlots === 0) {
        console.log(`No slots found for ${config?.venue?.name} on ${config.day}`);
        config.tries = config.tries + 1;

        const job = await watcherQueue.add(config, { delay: 1000 * 15});
        console.log('Job added back to queue');
        const {data:watcher} = await db.from('worker')
            .update({ tries: config.tries, jobId: job.id  })
            .eq('id', config.id)
            .select()
            .single();
        console.log(`Worker updated and has ${watcher.tries} tries`);
        return true;
    }
};

export const logRedisStatus = (watcherQueue:Queue<Types.Watcher>) => {
    watcherQueue.on('connected', () => {
        console.log('Queue connected to Redis');
    });
    
    watcherQueue.on('error', (error) => {
        console.log('Queue connection error: ', error);
    });
    
    watcherQueue.on('waiting', (jobId) => {
        console.log('Queue waiting for job: ', jobId);
    });
    
    watcherQueue.on('active', (job) => {
        console.log('Queue job started: ', job.id);
    });
    
    watcherQueue.on('completed', async (job) => {
        console.log('Queue job completed: ', job.id);
    });
    
    watcherQueue.on('failed', async (job, error) => {
        console.log('Queue job failed: ', job.id);
        console.log(error);
    });
    
    watcherQueue.on('progress', async (job, error) => {
        console.log('Queue in progress: ', job.id);
        console.log(error);
    });
    
    watcherQueue.on('remove', (job) => {
        console.log('Queue job removed: ', job.data);
    });
};