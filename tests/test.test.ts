import * as pino from 'pino';
import * as assert from 'assert';
import { Broker } from "../src/broker";
import { PriorityConsumerStrategy } from '../src/consumerStrategies/priorityConsumerStrategy';
import { CustomProducer } from "../src/customProducer";
// import { TtlConsumerStrategy } from "../src/consumerStrategies/ttlConsumerStrategy";
import { TestCustomConsumer } from './testCustomConsumer';
import { EventEmitter } from 'events';
import { Result } from './resultCollector';
import { Message } from 'src/message';

const buildExitHandler = () => {
    const eventEmitter = new EventEmitter();

    const exitPromise = new Promise<void>((resolve) => {
        eventEmitter.on('exit', () => resolve());
    });

    const onExit = () => {
        eventEmitter.emit('exit');
    }

    return {
        exitPromise,
        onExit,
    }
}

describe('Priority Message System', async function () {
    const logger = pino({
        level: 'silent',
        prettyPrint: true,
    });

    this.timeout(5000);

    it('works with the PriorityConsumerStrategy', async function () {
        const results: Result[] = [];
        const collectResult = (result: Result) => {
            results.push(result);
        }

        // const consumerStrategy = new TtlConsumerStrategy(4, 0);

        const consumerStrategy = new PriorityConsumerStrategy(logger,5);

        const consumers = [
            new TestCustomConsumer(logger,'A', collectResult, consumerStrategy),
            new TestCustomConsumer(logger,'B', collectResult, consumerStrategy),
            new TestCustomConsumer(logger,'C', collectResult, consumerStrategy),
        ];

        const exitHandler = buildExitHandler();

        const broker = new Broker(logger, consumers, 3, 3, 500, exitHandler.onExit);
        const producer = new CustomProducer(broker);

        for (let i = 0; i < 9; i++) {
            const message: Message = {
                data: `data_${i}`,
                priority: i,
                ttl: 5,
                predicateRunCount: 0,
            }

            producer.produce(JSON.stringify(message));
        }

        await exitHandler.exitPromise;

        assert.deepStrictEqual(
            results,
            [
                { consumerId: 'B', data: 'DATA_5' },
                { consumerId: 'C', data: 'DATA_6' },
                { consumerId: 'C', data: 'DATA_7' },
                { consumerId: 'C', data: 'DATA_8' },
                { consumerId: 'B', data: 'DATA_4' },
                { consumerId: 'C', data: 'DATA_3' },
                { consumerId: 'A', data: 'DATA_2' },
                { consumerId: 'B', data: 'DATA_1' },
                { consumerId: 'C', data: 'DATA_0' }
            ],
        )
    });
});

