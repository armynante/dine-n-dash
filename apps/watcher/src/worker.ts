import { bookSeating, markCompleteIfToday, resetFailures, seatingCheck, updateWatcherId, updateWatcherWithErrors } from './helpers.js';
import { DevWorker, Types, Worker } from 'diner-utilities';

export const runWorker = async (watcherConfig: Types.Watcher, jobID:string, WatcherQueue:Worker | DevWorker): Promise<void> => {
    try {
        console.log('Watcher running for', watcherConfig?.venue?.name, WatcherQueue);
    
        // Add the AWS SQS receipt handle to the watcher config
        const watcher = await updateWatcherId(watcherConfig, jobID,);
        console.log('Watcher updated with job id');

        // kill the job if it's past the start date
        await markCompleteIfToday(watcher, WatcherQueue);

        // check for seatings
        const seatings = await seatingCheck(watcher, WatcherQueue);
        await resetFailures(watcher, WatcherQueue);
        if (!seatings) return;

        // Book the first slot
        await bookSeating(seatings, watcher);

    } catch (error) {
        console.error('Watcher job failed with error');
        await updateWatcherWithErrors(watcherConfig, error, WatcherQueue);        
        console.error(error);
    }
};