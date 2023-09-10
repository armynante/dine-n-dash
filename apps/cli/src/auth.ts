import inquirer from 'inquirer';
import ora from 'ora';
import axios, { AxiosError } from 'axios';
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
                    name: 'Reset password',
                    value: 'changePassword'
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
        const userSpinner = ora('Creating new user');
        const { email, password, confirmPassword } = await inquirer.prompt([
            {
                type: 'input',
                name: 'email',
                message: 'What is your email?',
            },
            {
                type: 'password',
                name: 'password',
                message: 'What is your password?',
            },
            {
                type: 'password',
                name: 'confirmPassword',
                message: 'Confirm your password',
            }
        ]);
        try {
            if (password !== confirmPassword) {
                userSpinner.fail('Passwords do not match');
                auth();
            }
            userSpinner.start();
            const { data: newUser } = await axios.post(`${HOST}/auth/register`, {
                email,
                password
            });
            userSpinner.succeed('User created, please verify your email');
            console.log('New user created: ', newUser?.user?.email);
        } catch (err) {
            const error = err as AxiosError<Error>;
            userSpinner.fail(error.response?.data?.message);
            auth();
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
            await AuthHelpers.setToken(resp?.token);
            console.log('Logged in as', resp?.user?.email);       
            spinner.succeed(`Logged in as ${resp?.user?.email}`);
        } catch (err) {
            spinner.fail('Error logging in');
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
        
        logoutSpinner.succeed('Logout successful');
        break;
    }

    case 'changePassword': {
        const token = await AuthHelpers.getToken() as string;
        console.log(token);
        const { resetPassword } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'resetPassword',
                message: 'Are you sure you want to reset your password?',
            }
        ]);

        const resetSpinner = ora('Sending password reset email');

        if (!resetPassword) {
            console.log('Aborted');
            auth();
            return;
        }

        // Need to reset AuthTOkern when user is logged in

        try {

            await axios.post(`${HOST}/auth/reset-password`, {}, {
                headers: {
                    Authorization: token
                }
            }
            );
            resetSpinner.succeed('Email sent');
        } catch (err) {
            console.log('Error sending password reset email');
            const error = err as AxiosError<Error>;
            resetSpinner.fail(error.response?.data?.message);
            resetSpinner.stop();
        }
        break;
    }
    default:
        break;
    }

    return;
};

export default auth;