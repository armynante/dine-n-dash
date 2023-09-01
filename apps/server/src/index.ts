// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import express, { Request, Response } from 'express';
import serverless from 'serverless-http';
import watcherRoutes from './routes/watcher';
import authRoutes from './routes/auth';
import resyRoutes from './routes/resy';
import favoritesRoutes from './routes/favorites';

/* 
 * ########################################
 * #######  SERVER INITIALIZATION    ######
 * ########################################
 */

console.log('Starting server');

const app = express();
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

if (process.env.NODE_ENV === 'development') {    
    const port = process.env.SERVER_PORT || 4000;
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
} else {
    module.exports.handler = serverless(app);
}
