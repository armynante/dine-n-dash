import { DevWorker, Types } from 'diner-utilities';
import db from './db.js';
import { ProxyAgent, TextMSG, Worker } from 'diner-utilities';
import { ResyService } from 'diner-resy';

const Text = new TextMSG(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!,
    process.env.TWILIO_PHONE_NUMBER!,
);
const RESY_API_KEY = process.env.RESY_API_KEY!;

// const RESY_API_KEY = 'ResyAPI api_key="AIcdK2rLXG6TYwJseSbmrBAy3RP81ocd"';


const agent = ProxyAgent({
    host: process.env.PROXY_HOST!,
    port: parseInt(process.env.PROXY_PORT!),
    username: process.env.PROXY_USERNAME!,
    password: process.env.PROXY_PASSWORD!,
});

const Resy = new ResyService(agent, RESY_API_KEY);

export const updateWatcherId = async (config: Types.Watcher, jobId: string | number) => {
    const { data, error } = await db
        .client
        .from('worker')
        .update({ jobId, tries: config.tries += 1 })
        .eq('id', config.id)
        .select(`
            *,
            user ( * ),
            venue ( * )`
        )
        .single();

    if (error) {
        console.error('Watcher job failed with update error');
        console.error(error);
        throw error;
    }

    if (!data) {
        console.error('No data returned from update');
        console.error(error);
        throw error;
    }

    return data as Types.Watcher;
};

export const resetFailures = async (config: Types.Watcher, WatcherQueue:Worker | DevWorker) => {
    if (config.day) {
        const today  =  new Date(config.day) <= new Date();
        if (today) {
            console.log('Watcher past start date');
            await db
                .client
                .from('worker')
                .update({ failed: 0 })
                .eq('id', config.id)
                .select(`
                    *,
                    user ( * ),
                    venue ( * )`
                )
                .single();

            
            if (!config.jobId) {
                console.error('No job id found');
                return;
            }
            
            await WatcherQueue.deleteJob(config.jobId);
        }
    }
};

export const markCompleteIfToday = async (config: Types.Watcher, WatcherQueue:Worker | DevWorker) => {
    if (config.day) {
        const today  =  new Date(config.day) <= new Date();
        if (today) {
            console.log('Watcher past start date');
            await db
                .client
                .from('worker')
                .update({ tries: config.tries += 1, complete: true, expired: true  })
                .eq('id', config.id)
                .select(`
                    *,
                    user ( * ),
                    venue ( * )`
                )
                .single();

            
            if (!config.jobId) {
                console.error('No job id found');
                return;
            }
            if (config.user?.phoneNumber) {
                await Text.sendText(config.user.phoneNumber, `Watcher completed its run without finding a table for ${config.venue?.name} :(`);
            }
            await WatcherQueue.deleteJob(config.jobId);
        }
    }
};

export const seatingCheck = async (config: Types.Watcher, WatcherQueue:Worker | DevWorker) => {
    
    const seatings = await Resy.seatings(config);

    if (seatings.availibleSlots === 0) {
        console.log(`No slots found for ${config?.venue?.name} on ${config.day}`);
        console.log('Deleteing old job from queue');
        console.log(`Job id: ${config.jobId}`);
        const deleted = await WatcherQueue.deleteJob(config.jobId);
        console.log(deleted);
        console.log('Job deleted');
        return false;
    }

    console.log(`Found ${seatings.availibleSlots} slots for ${config?.venue?.name} on ${config.day}`);

    return seatings;
};

export const bookSeating = async (seatings: Types.SeatingResponse, config: Types.Watcher) => {
    const slot = seatings.slots[0];
    const bookingRequest = await Resy.requestBooking({
        config_id: slot.bookingData.config_id,
        party_size: slot.partySize,
        day: slot.dateTime,
        user: config.user,
    });

    const {data:confirmed} : { data: Types.ConfirmBookingResponse }= await Resy.confirmBooking(
        {
            book_token: bookingRequest.bookToken,
            user: config.user,
        }
    );

    if (confirmed.reservation_id) {
        console.log(`Sending text to ${config.user.phoneNumber}`);

        await db
            .client
            .from('worker')
            .update({ complete: true })
            .eq('id', config.id)
            .select(`
                *,
                user ( * ),
                venue ( * )
            `)
            .single();

        if (config.user?.phoneNumber) {
            await Text.sendText(config.user.phoneNumber, `Found a table at ${config?.venue?.name} for ${config?.partySize}`);
        }
    } else {
        console.log(`Booking failed for ${config.venue?.name}`);
    }
};

export const updateWatcherWithErrors = async (config: Types.Watcher, jobError:unknown, WatcherQueue:Worker | DevWorker) => {
    try {
        const update = { 
            jobError,
            failed: config.failed ? config.failed += 1 : 1,
            complete: config.failed ? config.failed >= 5 : false,
        };
        const { error } = await db
            .client
            .from('worker')
            .update({ ...update})
            .eq('id', config.id)
            .select(`
                *,
                user ( * ),
                venue ( * )`
            )
            .single();

        if (error) {
            console.error('Error updating watcher with error');
            console.error(error);
        }

        if (config.failed >= 5) {
            console.log('Watcher failed 5 times. Deleting job');
            // Text user that job failed
            if (config.user?.phoneNumber) {
                await Text.sendText(config.user.phoneNumber, `Watcher failed 5 times for ${config.venue?.name}\n Killing job.`);
            }
            await WatcherQueue.deleteJob(config.jobId);
        }
    } catch (error) {
        console.error('Error updating watcher with error');
        console.error(error);
    }
};
