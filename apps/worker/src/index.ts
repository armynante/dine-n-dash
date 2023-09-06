import Queue from 'bull';
import { ProxyAgent, TextMSG, Types } from 'diner-utilities';
import db from './db.js';
import { ResyService } from 'diner-resy';
import { logRedisStatus, markCompleteIfToday, seatingCheck } from './helpers.js';

const RESY_API_KEY = process.env.RESY_API_KEY!;
const RESERVATION_INTERVAL = process.env.RESERVATION_INTERVAL ? parseInt(process.env.RESERVATION_INTERVAL) : 1000 * 10; // 10 seconds

const agent = ProxyAgent({
    host: process.env.PROXY_HOST!,
    port: parseInt(process.env.PROXY_PORT!),
    username: process.env.PROXY_USERNAME!,
    password: process.env.PROXY_PASSWORD!,
});

const Resy = new ResyService(agent, RESY_API_KEY);
const Text = new TextMSG(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!,
    process.env.TWILIO_PHONE_NUMBER!,
);

export const watcherQueue = new Queue<Types.Watcher>('watcherQueue', {
    redis: {
        host: process.env.REDIS_HOST!,
        port: parseInt(process.env.REDIS_PORT!),
    },
});

logRedisStatus(watcherQueue);

watcherQueue.process(async (job) => {
    const watcherConfig = job.data as Types.Watcher;

    try {
        const isToday = await markCompleteIfToday(watcherConfig);
        if (isToday) return;

        console.log('Watcher running for', watcherConfig?.venue?.name);
        console.log('Pulling seatings...');
        const seatings = await Resy.seatings(watcherConfig);
        console.log(`Seatings: ${seatings?.availibleSlots} slots`);
        const noSeatings = await seatingCheck(seatings, watcherConfig, watcherQueue);
        if (noSeatings) return;

        console.log(`Attempting to book ${watcherConfig?.venue?.name} on ${watcherConfig.day}`);

        const slot = seatings.slots[0];
        const bookingRequest = await Resy.requestBooking({
            config_id: slot.bookingData.config_id,
            party_size: slot.partySize,
            day: slot.dateTime,
            user: watcherConfig.user,
        });

        const {data:confirmed} : { data: Types.ConfirmBookingResponse }= await Resy.confirmBooking(
            {
                book_token: bookingRequest.bookToken,
                user: watcherConfig.user,
            }
        );
    
        if (confirmed.reservation_id) {
            console.log(`Sending text to ${watcherConfig.user.phoneNumber}`);
            Text.sendText(watcherConfig.user.phoneNumber, `Found a table at ${watcherConfig?.venue?.name} for ${watcherConfig?.partySize}`);
        } else {
            console.log(`Booking failed for ${job?.data?.venue?.name}`);
        }

        console.log('Updating worker');
        await db.from('worker').client
            .update({
                complete: true,
            })
            .eq('id', job?.data?.id)
            .single();
        console.log('Worker updated');
        return confirmed;

    } catch (error) {
        console.log(`Booking failed for ${job?.data?.venue?.name}`);
        console.log(error);
        await db.from('worker').client
            .update({
                complete: true,
            })
            .eq('id', watcherConfig?.id)
            .single();
    }
});

watcherQueue.on('failed', async (job, error) => {
    const watcherConfig = job.data as Types.Watcher;

    try {
        console.log(`Watcher job failed with error ${error}`);
        const { data, error: dbError } = await db
            .from('worker')
            .select()
            .eq('id', job.data.id)
            .single();

        if (dbError) {
            console.log('Watcher job failed with db error');
            console.log(dbError);
            console.log(job);
            throw dbError;
        }

        // increment the number of failures
        const { data: updateData, error: updateError } = await db
            .from('worker')
            .update({ failed: data.failed + 1 })
            .eq('id', job?.data?.id)
            .select()
            .single();

        if (updateError) {
            console.log('Watcher job failed with update error');
            console.log(updateError);
            Text.sendText(watcherConfig.user.phoneNumber, `Watcher job failed with error ${error?.message} for ${watcherConfig?.venue?.name}`);
            throw updateError;
        }

        // if the number of failures is less than 3, re-add the job to the queue
        if (updateData?.failed < 5) {
            await watcherQueue.add(updateData, { delay: RESERVATION_INTERVAL });
            return;
        } 
        Text.sendText(watcherConfig.user.phoneNumber, `Watcher job failed with error ${error?.message} for ${watcherConfig?.venue?.name}`);
    }
    catch (error: unknown) {
        console.log(`Watcher job failed with error for ${watcherConfig?.venue?.name}`);
        console.log(error);
    }
});