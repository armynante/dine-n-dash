import { LambdaClient } from '@aws-sdk/client-lambda';
import ora from 'ora';
import inquirer from 'inquirer';
import { resolve, dirname } from 'path';
import { buildCLI, bumpVersion, deploy, deployNPMpackage, getEnvVars, runBuildScript, unlinkPackage } from './helpers.js';

const main = async () => {
    const spinner = ora('Building CLI app...');

    try {
        const parentDir = dirname('.');

        console.log(parentDir, parentDir);

        const lambdaClient = new LambdaClient({ region: 'us-east-1' });

        const apps = [
            {
                name: 'server',
                zipPath: resolve(parentDir, 'apps', 'server', './lambda/server-lambda.zip'),
                envPath: resolve(parentDir, 'apps', 'server', 'prod.env'),
                functionName: 'resy2Test',
            },
            {
                name: 'watcher',
                zipPath: resolve(parentDir, 'apps', 'watcher', 'watcher-lambda.zip'),
                envPath: resolve(parentDir, 'apps', 'watcher', 'prod.env'),
                functionName: 'diner-watcher-service',
            },
            {
                name: 'cli',
                zipPath: resolve(parentDir, 'apps', 'cli', 'cli-lambda.zip'),
                envPath: resolve(parentDir, 'apps', 'cli', 'prod.env'),
                functionName: '',
            }
        ];

        const { app } = await inquirer.prompt([
            {
                type: 'list',
                name: 'app',
                message: 'Which app do you want to deploy?',
                choices: apps.map(({ name }) => name),
            },
        ]);
        


        const selectedApp = apps.find(({ name }) => name === app);

        if (!selectedApp) {
            throw new Error('Invalid app');
        }

        // confirm app to build
        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: `Are you sure you want to build ${selectedApp.name}?`,
            },
        ]);

        if (!confirm) {
            spinner.fail('Aborted');
        } else {

            const envVars = getEnvVars(selectedApp.envPath);
            const startTime = Date.now();

            if (selectedApp.name === 'cli') {
                // build webpack bundle and push to npm registry
                const { version } = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'version',
                        message: 'What version level do you want to bump?',
                        choices: ['patch', 'minor', 'major'],
                    },
                ]);
                spinner.start('Unlinking NPM app...');
                await unlinkPackage(selectedApp.name);
                spinner.start('Building CLI app...');
                await buildCLI(selectedApp.name);
                spinner.succeed('Built CLI app');
                // spinner.start('Linking NPM app...');
                // await linkPackage(selectedApp.name);
                // spinner.succeed('Linked NPM app');
                spinner.start('Bumping version...');
                await bumpVersion(selectedApp.name, version);
                spinner.succeed('Bumped version');
                spinner.start('Deploying NPM app...');
                await deployNPMpackage(selectedApp.name);
                spinner.succeed('Deployed NPM app');
            } else {
                spinner.start(`Building ${selectedApp.name} package...`);
                await runBuildScript(selectedApp.name);
                await deploy(selectedApp, envVars, lambdaClient);
            }

            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);
            spinner.succeed(`Built ${selectedApp.name} package in ${duration}s`);
        }

    } catch (err) {
        spinner.fail('Failed to build CLI app');
        console.error(err);
    }
};

main();