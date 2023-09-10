// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import express, { Request, Response } from 'express';
import serverless from 'serverless-http';
import watcherRoutes from './routes/watcher.js';
import authRoutes from './routes/auth.js';
import resyRoutes from './routes/resy.js';
import favoritesRoutes from './routes/favorites.js';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

// Set up middleware
const corsOptions = {
    origin: 'http://localhost:5173',  // replace with your frontend app's URL
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

/* 
 * ########################################
 * #######     SERVER ROUTES         ######
 * ########################################
 */

app.use('/watch', watcherRoutes);
app.use('/auth', authRoutes);
app.use('/resy', resyRoutes);
app.use('/favorites', favoritesRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

let handle;

if (process.env.NODE_ENV === 'development') {    
    console.log('::::DEV::: Server initialized');
    const port = process.env.SERVER_PORT || 4000;
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
} else {
    console.log('::::PROD::: Server initialized');
    handle = serverless(app);
}

export const handler = handle;