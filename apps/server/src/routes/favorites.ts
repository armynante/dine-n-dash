
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Request, Response, Router } from 'express';
import db from '../db.js';
import { verifyToken } from 'diner-utilities';
import { Venue } from 'diner-utilities/dist/types.js';

const router = Router() as unknown as Router;

router.get('/', verifyToken, async (req: Request, res: Response) => {
    console.log('Getting favorites');
    const { token } = req;
    const user = await db.getUser(token.email);
    try {
        const { data, error } = await db
            .client
            .from('favorites')
            .select(`
                id,
                venue (
                    name,
                    site,
                    siteId,
                    neighborhood,
                    city
                )
            `)
            .eq('userId', user.id);

        if (error) {
            throw error;
        }

        const favorites = data.map((favorite: Venue) => {
            return {
                ...favorite.venue,
            };
        });

        res.status(200).json(
            {
                message: 'Favorites retrieved successfully',
                data: favorites,
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
});

router.delete('/:siteId', verifyToken, async (req: Request, res: Response) => {
    console.log('Deleting favorite');
    const { token } = req;
    const user = await db.getUser(token.email);
    const { siteId } = req.params;
    console.log(siteId);
    try {
        const { error } = await db
            .client
            .from('favorites')
            .delete()
            .eq('userId', user.id)
            .eq('siteId', siteId);

        if (error) {
            throw error;
        }

        res.status(200).json(
            {
                message: 'Favorite deleted successfully',
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
});

router.post('/', verifyToken, async (req: Request, res: Response) => {
    console.log('Adding restaurant');
    try {
        const { token } = req;
        const user = await db.getUser(token.email);
        console.log(user);
        const { restaurant } = req.body;
        console.log(restaurant);
        const { data, error } = await db
            .client
            .from('venue')
            .upsert(
                { 
                    site: 'resy',
                    siteId: restaurant.siteId,
                    name: restaurant.name,
                    city: restaurant.city,
                    neighborhood: restaurant.neighborhood,
                }, { onConflict: 'siteId' }
                
            )
            .select()
            .single();

        if (error) {
            throw error;
        }

        console.log('Finding favorite');
        const { error: favFindError } = await db
            .client
            .from('favorites')
            .select('siteId', 'userId')
            .eq('userId', user.id)
            .eq('siteId', data.siteId);

        if (favFindError) {
            throw favFindError;
        }

        console.log('Creating favorite');
        const {error:faveCreateError } = await db
            .client
            .from('favorites')
            .insert({
                userId: user.id,
                siteId: data.siteId,
            })
            .single();
        
        if (faveCreateError) {
            throw faveCreateError;
        }
        
        res.status(201).json(
            {
                message: 'Favorite created successfully',
                data: {
                    ...data,
                    isFavorite: true,
                },
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
});

export default router;