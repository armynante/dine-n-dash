import * as fs from 'fs';
import { AppConfig } from './types.js';
import { exec } from 'child_process';
import { LambdaClient, UpdateFunctionCodeCommand, UpdateFunctionConfigurationCommand, GetFunctionCommand } from '@aws-sdk/client-lambda';
import ora from 'ora';

export const getEnvVars = (envPath: string): Record<string, string> => {
    return fs.readFileSync(envPath, 'utf8')
        .split('\n')
        .filter((line) => line && !line.startsWith('#'))
        .reduce((obj: Record<string, string>, line) => {
            const [key, value] = line.split('=');
            obj[key] = value;
            return obj;
        }, {} as Record<string, string>);
};

export const buildCLI = async (appName:string) => {
    return new Promise((resolve, reject) => {
        //&& webpack --env app=apps/${appName}
        exec(`webpack --config webpack.cli.config.js --env app=apps/${appName}`, (error, stdout, stderr) => {
        // exec('tsc -b', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error}`);
                reject(error);
                return;
            }
            console.log(`stdout: ${stdout}\n`);
            console.log(`stderr: ${stderr}\n`);
            resolve(appName);
        });
    });
};

export const linkPackage = async (appName:string) => {
    return new Promise((resolve, reject) => {
        exec(`cd apps/${appName} && pnpm link`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error}`);
                reject(error);
                return;
            }
            console.log(`stdout: ${stdout}\n`);
            console.log(`stderr: ${stderr}\n`);
            resolve(appName);
        });
    });
};

export const unlinkPackage = async (appName:string) => {
    return new Promise((resolve, reject) => {
        exec(`cd apps/${appName} && pnpm unlink`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error}`);
                reject(error);
                return;
            }
            console.log(`stdout: ${stdout}\n`);
            console.log(`stderr: ${stderr}\n`);
            resolve(appName);
        });
    });
};

export const deployNPMpackage = async (appName:string) => {
    return new Promise((resolve, reject) => {
        // bump version
        exec(`cd apps/${appName} && pnpm publish --no-git-checks`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error}`);
                reject(error);
                return;
            }
            console.log(`stdout: ${stdout}\n`);
            console.log(`stderr: ${stderr}\n`);
            resolve(appName);
        });
    });
};

export const bumpVersion = async (appName:string, vesion:string) => {
    return new Promise((resolve, reject) => {
        // bump version
        exec(`cd apps/${appName} && npm version ${vesion}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error}`);
                reject(error);
                return;
            }
            console.log(`stdout: ${stdout}\n`);
            console.log(`stderr: ${stderr}\n`);
            resolve(appName);
        });
    });
};

export const buildCli = async (appName:string) => {
    await new Promise((resolve, reject) => {
        exec(`cd apps/${appName} && npm link`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error}`);
                reject(error);
                return;
            }
            console.log(`stdout: ${stdout}\n`);
            console.log(`stderr: ${stderr}\n`);
            resolve(appName);
        });
    });
};

export const runBuildScript = (app:string) => {
    return new Promise((resolve, reject) => {
        // exec(`webpack --config webpack.app.config.js --env app=apps/${app} && cd /apps/${app}/dist && zip -r ../${app}-lambda.zip .`, (error, stdout, stderr) => {
        exec(`webpack --config webpack.app.config.js --env app=apps/${app} && cd ./apps/${app}/dist && zip -r ../${app}-lambda.zip .`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error}`);
                reject(error);
                return;
            }
            console.log(`stdout: ${stdout}\n`);
            console.log(`stderr: ${stderr}\n`);
            resolve(app);
        });
    });
};

export const isDeployed = async (app:AppConfig, client:LambdaClient) => {
    const params = {
        FunctionName: app.functionName,
    };
  
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { Configuration: { LastUpdateStatus } } = await client.send(new GetFunctionCommand(params));
    if (LastUpdateStatus === 'Successful') {
        return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await isDeployed(app, client);
};

export const deploy = async (app:AppConfig, envVars:Record<string,string>, client:LambdaClient, retryCount:number = 0) => {
    const codeParams = {
        FunctionName: app.functionName,
        ZipFile: await fs.promises.readFile(app.zipPath),
        Environment: { Variables: envVars },
    };

    const spinner = ora('Deploying to AWS').start();
  
    try {
        await client.send(new UpdateFunctionCodeCommand(codeParams));
        const configParams = {
            FunctionName: app.functionName,
            Environment: { Variables: envVars },
        };
        await isDeployed(app, client);
        await client.send(new UpdateFunctionConfigurationCommand(configParams));
        spinner.succeed('Deployed to AWS');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        if (err?.code === 'ResourceConflictException' && retryCount < 5) { 
            spinner.text = 'Resource conflict, retrying...';
            await new Promise((resolve) => setTimeout(resolve, 5000));
            await deploy(app, envVars, client, retryCount); 
        } else {
            console.log(err);
        }
        spinner.fail('Failed to deploy to AWS');
    }
};