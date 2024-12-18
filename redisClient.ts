'use strict';

import Redis from 'ioredis';

export class PublishCompletedTransfersService
{
    private _redisClient: Redis;
    private _redisChannelName: string;

    constructor(redisConnectionStr: string, channelName: string) {
        this._redisClient = new Redis(redisConnectionStr);
        this._redisChannelName = channelName;
    }

    async init(): Promise<void> {
        try {
            const result = await this._redisClient.ping();
            if (result === 'PONG') {
                console.log('Redis is up on channel ' + this._redisChannelName);
            } else {
                throw new Error('Unexpected Redis ping response');
            }
        } catch (error) {
            console.error('Redis connection failed:', error);
            throw error;
        }
        return Promise.resolve();
    }

    async publishTransferCompleted(
        feesInformation: any,
    ): Promise<void> {
        await this._redisClient.publish(
            this._redisChannelName,
            JSON.stringify(feesInformation),
        );
        console.log('TRANSFER PUBLISHED: ', feesInformation);
        return;
    }
}


async function main(){
    try {
        const redisInstance = new PublishCompletedTransfersService('127.0.0.1:6379', '1508');
        await redisInstance.init()
        redisInstance.publishTransferCompleted(
            {
                transferId: crypto.randomUUID(),
                transferDate: new Date(),
                senderfinancialEntityId: 'pale',
                receiverfinancialEntityId: 'hassam',
                transferType: 'REMMITANCE',
                transferCurrency: 'USD',
                transferAmount: Math.random() * (666 - 1) + 1,
            },
        )
    }catch(
        e
    ){
        console.log(e)
    }
} 

main().then(
    (() => {
        console.log('terminado')
    })
).catch(
    (e)=>{
        console.log(e)
    }
).finally(
    ()=>{
        process.exit()
    }
)