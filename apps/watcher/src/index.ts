import { SQSEvent } from 'aws-lambda';
import { bookSeating, markCompleteIfToday, resetFailures, seatingCheck, updateWatcherId, updateWatcherWithErrors } from './helpers';
import { Types } from 'diner-utilities';

export const handler = async (event: SQSEvent): Promise<void> => {
    const { receiptHandle, body } = event.Records[0] as unknown as { receiptHandle: string, body: string };
    const watcherConfig = JSON.parse(body) as Types.Watcher;

    try {
        console.log('Watcher running for', watcherConfig?.venue?.name);
        
        // Add the AWS SQS receipt handle to the watcher config
        const watcher = await updateWatcherId(watcherConfig, receiptHandle);
        console.log('Watcher updated with job id');

        // kill the job if it's past the start date
        await markCompleteIfToday(watcher);

        // check for seatings
        const seatings = await seatingCheck(watcher);
        await resetFailures(watcher);
        if (!seatings) return;

        // Book the first slot
        await bookSeating(seatings, watcher);

    } catch (error) {
        console.error('Watcher job failed with error');
        await updateWatcherWithErrors(watcherConfig, error);        
        console.error(error);
    }
};
