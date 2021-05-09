import * as pino from 'pino';
import * as assert from 'assert';
import { Broker } from "../src/broker";
import { PredicateConsumerStrategy } from '../src/consumerStrategies/predicateConsumerStrategy';
import { PriorityConsumerStrategy } from '../src/consumerStrategies/priorityConsumerStrategy';
import { CustomProducer } from "../src/customProducer";
import { TtlConsumerStrategy } from "../src/consumerStrategies/ttlConsumerStrategy";
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

const buildResultHandler = () => {
    const results: Result[] = [];
    const collectResult = (result: Result) => {
        results.push(result);
    }

    return { results, collectResult };
}

describe('Priority Message System', async function () {
    const logger = pino({
        level: 'silent',
        prettyPrint: true,
    });

    this.timeout(5000);

    it('works with the PriorityConsumerStrategy', async function () {
        const resultHandler = buildResultHandler();

        const consumerStrategy = new PriorityConsumerStrategy(logger,5);

        const consumers = [
            new TestCustomConsumer(logger,'A', resultHandler.collectResult, consumerStrategy),
            new TestCustomConsumer(logger,'B', resultHandler.collectResult, consumerStrategy),
            new TestCustomConsumer(logger,'C', resultHandler.collectResult, consumerStrategy),
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
            resultHandler.results,
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

    it('works with the TtlConsumerStrategy', async function() {
        const resultHandler = buildResultHandler();

        const consumerStrategy = new TtlConsumerStrategy(logger, 0, 4);

        const consumers = [
            new TestCustomConsumer(logger,'A', resultHandler.collectResult, consumerStrategy),
            new TestCustomConsumer(logger,'B', resultHandler.collectResult, consumerStrategy),
            new TestCustomConsumer(logger,'C', resultHandler.collectResult, consumerStrategy),
        ];

        const exitHandler = buildExitHandler();

        const broker = new Broker(logger, consumers, 3, 3, 500, exitHandler.onExit);
        const producer = new CustomProducer(broker);

        for (let i = 0; i < 9; i++) {
            const message: Message = {
                data: `data_${i}`,
                priority: 0,
                ttl: 9 - i,
                predicateRunCount: 0,
            }

            producer.produce(JSON.stringify(message));
        }

        await exitHandler.exitPromise;

        assert.deepStrictEqual(
            resultHandler.results,
            [
                { consumerId: 'C', data: 'DATA_6' },
                { consumerId: 'C', data: 'DATA_7' },
                { consumerId: 'C', data: 'DATA_8' },
                { consumerId: 'B', data: 'DATA_5' },
                { consumerId: 'A', data: 'DATA_4' },
                { consumerId: 'B', data: 'DATA_3' },
                { consumerId: 'C', data: 'DATA_2' },
                { consumerId: 'A', data: 'DATA_1' },
                { consumerId: 'B', data: 'DATA_0' }
            ],
        )
    })

    it('works with the PredicateConsumerStrategy', async function() {
        const resultHandler = buildResultHandler();

        const consumerStrategy = new PredicateConsumerStrategy(logger, 'data_0', 3);

        const consumers = [
            new TestCustomConsumer(logger,'A', resultHandler.collectResult, consumerStrategy),
            new TestCustomConsumer(logger,'B', resultHandler.collectResult, consumerStrategy),
        ];

        const exitHandler = buildExitHandler();

        const broker = new Broker(logger, consumers, 3, 3, 500, exitHandler.onExit);
        const producer = new CustomProducer(broker);

        for (let i = 0; i < 3; i++) {
            const message: Message = {
                data: `data_${i}`,
                priority: 0,
                ttl: 0,
                predicateRunCount: 0,
            }

            producer.produce(JSON.stringify(message));
        }

        await exitHandler.exitPromise;

        assert.deepStrictEqual(
            resultHandler.results,
            [
                { consumerId: 'A', data: 'DATA_1' },
                { consumerId: 'A', data: 'DATA_2' },
                { consumerId: 'B', data: 'DATA_0' }
            ],
        )
    });
});

