import { SESClient, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-ses';
import { EmailMSG } from './types';

const sesClient = new SESClient({ region: 'us-east-1' });


const createMesage = ({ to, from, subject, body }:EmailMSG) => {
    return {
        Destination: {
            ToAddresses: [to],
        },
        Message: {
            Body: {
                Text: { Data: body },
            },
            Subject: { Data: subject },
        },
        Source: from,
    };
};

const send = async (params:SendEmailCommandInput) => {
    try {
        const data = await sesClient.send(new SendEmailCommand(params));
        console.log('Email sent:', data);
    } catch (error) {
        console.error('Error:', error);
    }
};

export const verify = async (to:string) => {
    const params = createMesage({
        to,
        from: process.env.EMAIL_FROM!,
        subject: 'Welcome to Resy Watcher',
        body: `
            Welcome to dine-n-dash. Please click the link below to verify your email address.
            ${process.env.HOST}/auth/verify?email=${to}
        `
    });
    await send(params);
};

export const reset = async (to:string, token:string) => {
    const params = createMesage({
        to,
        from: process.env.EMAIL_FROM!,
        subject: 'Password reset',
        body: `
            Please click the link below to reset your password.
            ${process.env.HOST}/auth/reset-password?token=${token}
        `
    });
    await send(params);
};
