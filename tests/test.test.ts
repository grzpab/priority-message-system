import * as assert from 'assert';
import { Broker } from "../src/broker";
import { PriorityConsumerStrategy } from '../src/consumerStrategies/priorityConsumerStrategy';
import { CustomProducer } from "../src/customProducer";
// import { TtlConsumerStrategy } from "../src/consumerStrategies/ttlConsumerStrategy";
import { TestCustomConsumer } from './testCustomConsumer';
import { EventEmitter } from 'events';
import { Result } from './resultCollector';

describe('', () => {
    it('', async function () {
        this.timeout(5000);

        const results: Result[] = [];
        const collectResult = (result: Result) => {
            results.push(result);
        }

        // const consumerStrategy = new TtlConsumerStrategy(4, 0);

        const consumerStrategy = new PriorityConsumerStrategy(5);

        const consumers = [
            new TestCustomConsumer('A', collectResult, consumerStrategy),
            new TestCustomConsumer('B', collectResult, consumerStrategy),
            new TestCustomConsumer('C', collectResult, consumerStrategy),
        ];

        const eventEmitter = new EventEmitter();

        const exitPromise = new Promise<void>((resolve) => {
            eventEmitter.on('exit', () => resolve());
        });

        const onExit = () => {
            eventEmitter.emit('exit');
        }

        const broker = new Broker(consumers, 3, 3, 500, onExit);

        const producer = new CustomProducer(broker);

        for (let i = 0; i < 9; i++) {
            producer.produce(JSON.stringify({
                data: i.toString(10),
                priority: i,
                ttl: 5,
            }));
        }

        await exitPromise;

        assert.deepStrictEqual(
            results,
            [],
        )
    });
});

