import Twilio from 'twilio';
export class TextMSG {

    client;
    twilioPhoneNumber: string;

    constructor(accountSid: string, public authToken: string, public phoneNumber: string) {
        this.client = this.buildClient(accountSid, authToken);
        if (!phoneNumber) {
            throw new Error('Missing TWILIO_PHONE_NUMBER environment variable');
        }
        this.twilioPhoneNumber = phoneNumber;
    }


    private buildClient(accountSid: string, authToken: string) {
        if (!accountSid || !authToken) {
            throw new Error('Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN environment variable');
        }
        return Twilio(accountSid, authToken);

    }
    
    async sendText(to: string, body: string) {
        const message = await this.client.messages.create({
            body: body,
            from: this.twilioPhoneNumber,
            to: to,
        });
        console.log(message.sid);
    }
}