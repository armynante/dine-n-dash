import { Watcher, WatcherMessage } from './types.js';
import { SQSClient, SendMessageCommand, PurgeQueueCommand, DeleteMessageCommand, SendMessageBatchCommand } from '@aws-sdk/client-sqs';
import Queue from 'bull';

export class Worker {

    queue: SQSClient;
    queueUrl: string = process.env.QUEUE_URL!;
    accessKeyId: string = process.env.ACCESS_KEY_ID!;
    secretAccessKey: string = process.env.SECRET_ACCESS_KEY!;
    

    constructor() {
        this.queue = this.createQueue();
        if (!this.accessKeyId || !this.secretAccessKey) {
            throw new Error('AWS credentials not found');
        }
    }

    private createQueue() {
        return new SQSClient({
            region: 'us-east-1',
            credentials: {
                accessKeyId: this.accessKeyId,
                secretAccessKey: this.secretAccessKey,
            },
        });
    }

    async clear() {
        const input = {
            QueueUrl: this.queueUrl,
        };
        const command = new PurgeQueueCommand(input);
        return await this.queue.send(command);
    }

    async test(message:Record<string,unknown>, delaySeconds: number = 0) {
        const command = new SendMessageCommand({
            QueueUrl: this.queueUrl,
            MessageBody: JSON.stringify(message),
            DelaySeconds: delaySeconds,
        });
        return await this.queue.send(command);
    }

    async add(payload: Watcher, delaySeconds: number = 0) {
        const command = new SendMessageCommand({
            QueueUrl: this.queueUrl,
            MessageBody: JSON.stringify(payload),
            DelaySeconds: delaySeconds,
        });
        return await this.queue.send(command);
    }
    
    async sendBatch(payloads: WatcherMessage[]) {
        console.log('Sending PROD batch');
        const entries = payloads.map((payload) => {
            return {
                Id: payload.id,
                MessageBody: JSON.stringify(payload.message),
                DelaySeconds: payload.delay,
            };
        });
        const command = new SendMessageBatchCommand({
            QueueUrl: this.queueUrl,
            Entries: entries,
        });
        return await this.queue.send(command);
    }

    // AWS SQS does not support getting a job by id
    // you use the receipt handle to delete the job
    async deleteJob(receiptHandle: string) {
        try {
            const command = new DeleteMessageCommand({
                QueueUrl: this.queueUrl,
                ReceiptHandle: receiptHandle,
            });
            return await this.queue.send(command);
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}

export class DevWorker {

    queue: Queue.Queue;

    constructor() {
        this.queue = this.createQueue();
    }

    private createQueue() {
        console.log('Connecting to Redis at', process.env.REDIS_HOST!);
        return new Queue<Watcher>('watcherQueue', {
            redis: {
                host: process.env.REDIS_HOST!,
                port: parseInt(process.env.REDIS_PORT!),
            },
        });
    }

    async clear() {
        await this.queue.empty();
        const queueLength = await this.queue.count();
        console.log('Queue length:', queueLength);
    }

    async test(message:Record<string,unknown>) {
        await this.queue.add(message);
    }

    async add(payload: Watcher) {
        await this.queue.add(payload);
        const queueLength = await this.queue.count();
        console.log('Queue length:', queueLength);
    }

    async sendBatch(payloads: Watcher[]) {
        console.log('Sending DEV batch');
        console.log(payloads.length);
        const jobs = payloads.map((payload) => {
            return {
                data: payload,
            };
        });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await this.queue.addBulk(jobs);
    }

    async deleteJob(jobId: string) {
        try {
            const job = await this.queue.getJob(jobId);
            if (!job) return false;
            await job.remove();
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}