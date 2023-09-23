/* eslint-disable no-case-declarations */

import axios from 'axios';
import inquirer from 'inquirer';
import ora from 'ora';
import Table from 'cli-table';
import { AuthHelpers, Types } from 'diner-utilities';

const HOST = process.env.HOST || 'https://nxy3qkvysgdtkjefwu3vjggn5i0qjgsp.lambda-url.us-east-1.on.aws';
const CONTROLLER_HOST = process.env.CONTROLLER_HOST || 'http://ec2-52-202-82-154.compute-1.amazonaws.com';

console.info('Controller host', CONTROLLER_HOST);

const clearWatch = async () => {
    const token = await AuthHelpers.getToken() as string;

    if (!token) {
        console.log('Please login first');
        return;
    }
    const { clear } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'clear',
            message: 'Are you sure you want to clear the watch list?',
        }
    ]);
  
    if (!clear) {
        console.log('Watch clear aborted');
        return;
    }
  
    const spinner = ora('Clearing watch list 🔍').start();
    const { data:response} = await axios
        .delete(`${HOST}/watchers/clear`,
            {
                headers: {
                    Authorization: token
                }
            });
    console.log(response);
    spinner.stop();
    console.log('Watch list cleared');
    return;
};

const removeWatch = async (watcher:Types.Watcher) => {
    const token = await AuthHelpers.getToken() as string;

    if (!token) {
        console.log('Please login first');
        return;
    }
    await axios.delete(`${HOST}/watchers/${watcher.id}`,
        {
            headers: {
                Authorization: token
            }
        });
    return;
};

const cronController = async () => {
    const token = await AuthHelpers.getToken() as string;

    if (!token) {
        console.log('Please login first');
        return;
    }
    
    const { cron } = await inquirer.prompt([
        {
            type: 'list',
            name: 'cron',
            message: 'Select the option to continue',
            choices: [
                {
                    name: 'Start',
                    value: 'run'
                },
                {
                    name: 'Stop',
                    value: 'stop'
                },
                {
                    name: 'Schedule',
                    value: 'schedule'
                },
                {
                    name: 'Status',
                    value: 'status'
                },
                {
                    name: 'Back',
                    value: 'back'
                },
                {
                    name: 'Exit',
                    value: 'exit'
                }
            ]
        }
    ]);

    if (cron === 'exit') {
        return;
    }

    if (cron === 'back') {
        await watcherQueue();
        return;
    }

    if (cron === 'status') {
        const spinner = ora('Fetching cron status 🔍').start();
        const { data:response} = await axios
            .get(`${CONTROLLER_HOST}/status`,
                {
                    headers: {
                        Authorization: token
                    }
                });
        spinner.stop();
        const table = new Table({
            head: ['Status'],
        });
        table.push([`The controller service is: ${response}`]);
        console.log(table.toString());
        await cronController();
        return;
    }

    if (cron === 'run') {
        const spinner = ora('Running cron now 🔍').start();
        const { data:response} = await axios
            .post(`${CONTROLLER_HOST}/start`,
                null,
                {
                    headers: {
                        Authorization: token
                    }
                });
        spinner.stop();
        console.log(response);
        await cronController();
        return;
    }

    if (cron === 'stop') {
        const spinner = ora('Stopping cron 🔍').start();
        const { data:response} = await axios
            .post(`${CONTROLLER_HOST}/stop`,
                null,
                {
                    headers: {
                        Authorization: token
                    }
                });
        spinner.stop();
        console.log(response);
        await cronController();
        return;
    }

    if (cron === 'schedule') {
        const { schedule } = await inquirer.prompt([
            {
                type: 'input',
                name: 'schedule',
                message: 'How often do you want to run the cron? (in seconds)',
                default: 15
            }
        ]);

        const spinner = ora('Scheduling cron 🔍').start();
        const { data:response} = await axios
            .post(`${CONTROLLER_HOST}/setCron`,
                { schedule },
                {
                    headers: {
                        Authorization: token
                    }
                });
        spinner.stop();
        console.log(response);
        return;
    }
};


const watcherQueue = async () => {
    const token = await AuthHelpers.getToken() as string;

    if (!token) {
        console.log('Please login first');
        return;
    }
    const { optionList } = await inquirer.prompt([
        {
            type: 'list',
            name: 'optionList',
            message: 'Select the option to continue',
            choices: [
                {
                    name: 'List all watchers',
                    value: 'list'
                },
                {
                    name: 'Clear all watchers',
                    value: 'clear'
                },
                {
                    name: 'Controller',
                    value: 'cron'
                },
                {
                    name: 'Exit',
                    value: 'exit'
                }
            ]
        }
    ]);

    switch (optionList) {
    case 'clear':
        await clearWatch();
        break;
    case 'list':
        await listWatch();
        break;
    case 'cron':
        await cronController();
        break;
    case 'exit':
        return;
    }
};

const listWatch = async () => {
    const token = await AuthHelpers.getToken() as string;

    if (!token) {
        console.log('Please login first');
        return;
    }
    const spinner = ora('Fetching watch list 🔍').start();
    const { data:watchList } = await axios
        .get(`${HOST}/watchers`,
            {
                headers: {
                    Authorization: token
                }
            });
    spinner.succeed(watchList.message);

    if (!watchList.data.length) {
        console.log('No watch list found');
        return;
    }

    const { option } = await inquirer.prompt([
        {
            type: 'list',
            name: 'option',
            message: 'Select the option to continue',
            choices: watchList.data.map((watcher:Types.Watcher, iDx:number) => {
                return {
                    name: `${iDx + 1}. ${watcher?.venue?.name} @ ${new Date(watcher?.day).toDateString()} for ${watcher?.partySize} people`,
                    value: watcher
                };
            })
        }
    ]);

    if (!option) {
        console.log('No watch list found');
        return;
    }

    const { optionList } = await inquirer.prompt([
        {
            type: 'list',
            name: 'optionList',
            message: 'Select the option to continue',
            choices: [
                {
                    name: 'View Details',
                    value: 'details'
                },
                {
                    name: 'Remove watcher',
                    value: 'remove'
                },
                {
                    name: 'Exit',
                    value: 'exit'
                },
                {
                    name: 'Controller',
                    value: 'cron'
                }
            ]
        }
    ]);

    switch (optionList) {

    case 'details':
        const table = new Table({
            head: ['Id', 'Venue', 'Failed?','Complete?','Start Date','Start Time', 'End Time', 'Party Size', 'Times Run'],
            colWidths: [5, 10, 10, 10, 10, 10, 10, 10, 10]
        });
        table.push([
            option?.id,
            option?.venue?.name,
            option?.failed ? 'Yes' : 'No',
            option?.complete ? 'Yes' : 'No',
            new Date(option?.day).toDateString(),
            new Date(option.startTime).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
            new Date(option.endTime).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
            option?.partySize,
            option?.tries
        ]);
        console.log(table.toString());
      
        const { optionList } = await inquirer.prompt([
            {
                type: 'list',
                name: 'optionList',
                message: 'Select the option to continue',
                choices: [
                    {
                        name: 'Back',
                        value: 'back'
                    },
                    {
                        name: 'Exit',
                        value: 'exit'
                    },
                    {
                        name: 'Remove watcher',
                        value: 'remove'
                    }
                ]
            }
        ]);

        if (optionList === 'exit') {
            return;
        }

        if (optionList === 'remove') {
            removeWatch(option);
            return;
        }

        if (optionList === 'back') {
            await listWatch();
            return;
        }


        break;
    case 'remove':
        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: 'Are you sure you want to remove this watcher?',
            }
        ]);
        if (!confirm) {
            console.log('Remove watcher aborted');
            return;
        }
        const spinner = ora('Removing watcher ❌').start();
        try {
            await removeWatch(option);
            spinner.stop();
            console.log('Watcher removed');
        } catch (e) {
            console.error('Failed to remove watcher');
            spinner.stop();
            console.log(e);
        }
        break;
    case 'exit':
        return;
    }

    return;

};

export default watcherQueue;