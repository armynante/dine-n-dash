import inquirer from 'inquirer';
import ora from 'ora';
import Table from 'cli-table';
import axios from 'axios';
import { AuthHelpers, Types } from 'diner-utilities';

const HOST = process.env.HOST || 'https://nxy3qkvysgdtkjefwu3vjggn5i0qjgsp.lambda-url.us-east-1.on.aws';

const listFavorites = async () => {
    const token = await AuthHelpers.getToken() as string;
    if (!token) {
        console.log('You need to be logged in to view favorites');
        return;
    }
    const spinner = ora('Loading favorites').start();
    const { data: favorites } = await axios.get(`${HOST}/favorites`, {
        headers: {
            Authorization: token
        }
    });
    spinner.stop();

    const table = new Table({
        head: ['Name', 'City'],
    });

    favorites.forEach((favorite:Types.Venue) => {
        table.push([favorite.name, favorite.city]);
    });

    console.log(table.toString());
    return;
};

const addFavorite = async () => {
    const token = await AuthHelpers.getToken() as string;
    if (!token) {
        console.log('You need to be logged in to add favorites');
        return;
    }
    const { favorite } = await inquirer.prompt([
        {
            type: 'input',
            name: 'favorite',
            message: 'What is the name of the favorite?',
        }
    ]);
    const spinner = ora('Adding favorite').start();
    const { data: response } = await axios.get(`${HOST}/resy/search`, {
        params: {
            venueName: favorite
        },
        headers: {
            Authorization: token
        }
    });
    spinner.stop();
    if (response.count === 0) {
        console.log('No favorites found');
        return;
    } else if (response.count === 1) {
        const { data: favorite } = await axios.post(`${HOST}/favorites`, {
            id: response[0].id
        }, {
            headers: {
                Authorization: token
            }
        });
        console.log(`Added ${favorite.name} to favorites`);
        return;
    } else {
        const { favorite } = await inquirer.prompt([
            {
                type: 'list',
                name: 'favorite',
                message: 'Select the favorite to add',
                choices: response.venues?.map((place:Types.Venue, iDx:number) => {
                    return {
                        name: `${iDx + 1}. ${place?.name} in ${place.neighborhood} - ${place?.locality}`,
                        value: place
                    };
                })
            }
        ]);
        const { data: favoriteResponse } = await axios.post(`${HOST}/favorites`, {
            site: 'resy',
            name: favorite.name,
            siteData: favorite
        }, {
            headers: {
                Authorization: token
            }
        });
        console.log(`Added ${favoriteResponse.name} to favorites`);
        return;
    }
};
const favorites = async () => {

    const { options } = await inquirer.prompt([
        {
            type: 'list',
            name: 'options',
            message: 'What do you want to do?',
            choices: [
                {
                    name: 'List all favorites',
                    value: 'list'
                },
                {
                    name: 'Add a favorite',
                    value: 'add'
                },
                {
                    name: 'Remove a favorite',
                    value: 'remove'
                },
                {
                    name: 'Search all favorites',
                    value: 'search'
                },
                {
                    name: 'Exit',
                    value: 'exit'
                }
            ]
        }
    ]);

    switch (options) {
    case 'list':
        await listFavorites();
        break;
    case 'add':
        await addFavorite();
        break;
        // case 'remove':
        //   await removeFavorite();
        //   break;
        // case 'search':
        //   await searchFavorites();
        //   break;
    case 'exit':
        return;
    }
};

export default favorites;