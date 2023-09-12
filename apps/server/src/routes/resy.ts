// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Request, Response, Router } from 'express';
import db from '../db.js';
import { ResyService } from 'diner-resy';
import { ProxyAgent, verifyToken } from 'diner-utilities';
import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET;

if (!secretKey) {
    throw new Error('Missing JWT_SECRET environment variable');
}

/* 
 * ########################################
 * #######  RESY INITIALIZATION    ########
 * ########################################
 */

const agent = ProxyAgent({
    host: process.env.PROXY_HOST!,
    port: parseInt(process.env.PROXY_PORT!),
    username: process.env.PROXY_USERNAME!,
    password: process.env.PROXY_PASSWORD!,
});

const RESY_API_KEY = 'ResyAPI api_key="AIcdK2rLXG6TYwJseSbmrBAy3RP81ocd"';
const Resy = new ResyService(agent, RESY_API_KEY);

const router = Router() as Router;


router.post('/login', verifyToken, async (req: Request, res: Response) => {
    console.log('Logging in with Resy auth...');
    try {
        const { email, password } = req.body;
        const { token: user } = req;
        const resyUser = await Resy.login(email, password);
        const updatedUser = await db.updateUser(user, { 
            resyLegacyToken: resyUser.resyLegacyToken,
            resyToken: resyUser.resyToken,
            resyRefreshToken: resyUser.resyRefreshToken,
            resyPaymentMethodId: resyUser.resyPaymentMethodId,
            resyGuestId: resyUser.resyGuestId,
            resyId: resyUser.resyId,
            resyEmail: resyUser.resyEmail,
        });
        console.log('User updated');
        const token = jwt.sign(updatedUser, secretKey, { expiresIn: '365d' });

        res.status(200).send({token, user: updatedUser});
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: error.message || 'An error occurred while processing the login request',
        });
    }
});

router.get('/search', verifyToken, async (req: Request, res: Response) => {
    try {
        const { venueName } = req.query;
        const { token: user } = req;
        console.log(`Searching for ${venueName}`);
        const venues = await Resy.searchVenues(user as User, venueName as string);
        res.status(200).send(venues);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

router.get('/seatings', verifyToken, async (req: Request, res: Response) => {
    try {
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
        const seatings = await Resy.seatings(query);
        res.status(200).send(seatings);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

router.post('/book', verifyToken, async (req: Request, res: Response) => {
    try {
        const { slot } = req.body;
        const { token: user } = req; 
        const bookingRequest = await Resy.requestBooking({
            config_id: slot.bookingData.config_id,
            party_size: slot.partySize,
            day: slot.dateTime,
            user: user as User,
        });
  
        // sleep 5 seconds        // await sleep(5000);

        const {data:confirmed} = await Resy.confirmBooking(
            {
                user: user as User,
                book_token: bookingRequest.bookToken
            }
        );
        res.status(200).json(confirmed);
    } catch (error) {
        // console.error(error);
        res.status(500).json(error);
    }
});

export default router;