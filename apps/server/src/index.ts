// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import express, { Request, Response } from 'express';
import watcherRoutes from './routes/watchers.js';
import authRoutes from './routes/auth.js';
import resyRoutes from './routes/resy.js';
import userRoutes from './routes/user.js';
import favoritesRoutes from './routes/favorites.js';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

dotenv.config();

// Set up middleware
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 204,
    credentials: true,
};

/* 
 * ########################################
 * #######  SERVER INITIALIZATION    ######
 * ########################################
 */

console.log('Starting server');

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('combined'));

/* 
* ########################################
* #######     SERVER ROUTES         ######
* ########################################
*/

app.use('/watchers', watcherRoutes);
app.use('/auth', authRoutes);
app.use('/resy', resyRoutes);
app.use('/favorites', favoritesRoutes);
app.use('/users', userRoutes);

app.get('/', (req: Request, res: Response) => {
    res.json(
        {
            message: 'Hello from the Dine & Dash API',
            data: {
                version: '1.0.0',
            },
        },
    );});

let handle;

console.log(':::Server initialized:::');
const port = process.env.SERVER_PORT || 4000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});


export const handler = handle;