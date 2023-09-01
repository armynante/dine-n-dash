import inquirer from 'inquirer';
import ora from 'ora';
import axios from 'axios';
import { AuthHelpers } from 'diner-utilities';

const HOST = process.env.HOST || 'https://nxy3qkvysgdtkjefwu3vjggn5i0qjgsp.lambda-url.us-east-1.on.aws';

const auth = async () => {

    const { options } = await inquirer.prompt([
        {
            type: 'list',
            name: 'options',
            message: 'What do you want to do?',
            choices: [
                {
                    name: 'Register as a new user',
                    value: 'new'
                },
                {
                    name: 'Login',
                    value: 'login'
                },
                {
                    name: 'Login to Resy',
                    value: 'resyLogin'
                },
                {
                    name: 'Logout',
                    value: 'logout'
                },
                {
                    name: 'Change password',
                },
                {
                    name: 'Change email',
                },
                {
                    name: 'Exit',
                    value: 'exit'
                }
            ]
        }
    ]);

    switch (options) {
    case 'new': {
        const { email, password } = await inquirer.prompt([
            {
                type: 'input',
                name: 'email',
                message: 'What is your email?',
            },
            {
                type: 'password',
                name: 'password',
                message: 'What is your password?',
            }
        ]);
        try {

            const userSpinner = ora('Creating new user').start();
            const { data: newUser } = await axios.post(`${HOST}/auth/register`, {
                email,
                password
            });
            userSpinner.stop();
            console.log('New user created: ', newUser?.user?.email);
        } catch (err) {
            console.log('Error creating new user');
        }
        break;
    }

    case 'resyLogin': {
        const token = await AuthHelpers.getToken() as string;
        const { email, password } = await inquirer.prompt([
            {
                type: 'input',
                name: 'email',
                message: 'What is your Resy email?',
            },
            {
                type: 'password',
                name: 'password',
                message: 'What is your Resy password?',
            }
        ]);
        const userSpinner = ora('Login in to Resy').start();
        try {

            const { data: updatedToken } = await axios.post(`${HOST}/resy/login`, {
                email,
                password
            }, {
                headers: {
                    Authorization: token
                }
            }
            );
            userSpinner.stop();
            console.log('Login successful');
            AuthHelpers.setToken(updatedToken);
        } catch (err) {
            console.log('Error logging in to Resy');
            userSpinner.stop();
        }
        break;
    }

    case 'login': {
        const { email: loginEmail, password: loginPassword } = await inquirer.prompt([
            {
                type: 'input',
                name: 'email',
                message: 'What is your email?',
            },
            {
                type: 'password',
                name: 'password',
                message: 'What is your password?',
            }
        ]);

        const spinner = ora('Logging in').start();
        try {
            const { data: resp } = await axios.post(`${HOST}/auth/login`, {
                email: loginEmail,
                password: loginPassword
            });
            spinner.stop();
            console.log('Logged in as', resp?.user?.email);       
            await AuthHelpers.setToken(resp?.token);
            console.log('Token saved');
        } catch (err) {
            spinner.stop();
            console.log('Error logging in');
            console.log(err);
            return;
        }
        break;
    }
    case 'exit':
        break;

    case 'logout': {
        const logoutSpinner = ora('Logging out').start();
        await AuthHelpers.deleteToken();
        
        logoutSpinner.stop();
        console.log('logout successful');
        break;
    }
    default:
        break;
    }

    return;
};

export default auth;