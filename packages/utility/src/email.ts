import { SESClient, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-ses';
import { EmailMSG } from './types.js';
import dotenv from 'dotenv';
dotenv.config();

export class Email {
    client: SESClient;

    constructor() {
        if (!process.env.EMAIL_FROM) {
            throw new Error('EMAIL_FROM not found');
        }
        this.client = this.createClient();
    }

    private createClient() {
        return new SESClient({
            region: 'us-east-1',
            credentials: {
                accessKeyId: process.env.ACCESS_KEY_ID!,
                secretAccessKey: process.env.SECRET_ACCESS_KEY!,
            },
        });
    }

    send = async (params:SendEmailCommandInput) => {
        try {
            const data = await this.client.send(new SendEmailCommand(params));
            console.log('Email sent:', data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    verify = async (to:string, token:string) => {
        const params = this.createMessage({
            to,
            from: process.env.EMAIL_FROM!,
            subject: 'Welcome to Resy Watcher',
            body: `
                Welcome to dine-n-dash. Please click the link below to verify your email address.
                ${process.env.HOST}/auth/verify?email=${to}&token=${token}
            `,
            html: `
                <p>Welcome to dine-n-dash. Please click the link below to verify your email address.</p>
                <a href="${process.env.HOST}/auth/verify?email=${to}&token=${token}">Verify Email</a>
            `
        });
        await this.send(params);
    };

    reset = async (to:string, token:string) => {
        const params = this.createMessage({
            to,
            from: process.env.EMAIL_FROM!,
            subject: 'Password reset',
            body: `
                Please click the link below to reset your password.
                ${process.env.WEB_HOST}/new-password?token=${token}&email=${to}
            `,
            html: `
                <p>Please click the link below to reset your password.</p>
                <a href="${process.env.WEB_HOST}/new-password?token=${token}&email=${to}">Reset Password</a>
            `

        });
        await this.send(params);
    };

    createMessage = ({ to, from, subject, body, html }:EmailMSG) => {
        return {
            Destination: {
                ToAddresses: [to],
            },
            Message: {
                Body: {
                    Text: { Data: body },
                    Html: { Data: html },
                },
                Subject: { Data: subject },
            },
            Source: from,
        };
    };

}