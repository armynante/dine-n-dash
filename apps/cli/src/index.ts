#!/usr/bin/env node
import { program } from 'commander';
import searchResy from './searchResy.js';
import watcherQueue from './watcherQueue.js';
import auth from './auth.js';
import favorites from './favorites.js';
import dotenv from 'dotenv';

dotenv.config();

program
    .version('0.0.1')
    .description('Resy CLI');

program
    .command('watch')
    .description('look for a table a restaurant and book it')
    .action(async () => {
        await watcherQueue();
    });

program
    .command('auth')
    .description('authenticate with Diner')
    .action(async () => {
        await auth();
    });

program
    .command('faves')
    .description('Add favorite restaurants')
    .action(async () => {
        await favorites();
    });

program
    .command('search')
    .description('search for a venue on Resy')
    .action(async () => {
        await searchResy();
    });

program.parse(process.argv);
