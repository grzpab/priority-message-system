import { Message } from 'src/message';
import { ConsumerStrategy } from '../src/consumerStrategies/consumerStrategy';
import { CustomConsumer } from '../src/customConsumer';
import {
    CollectResult,
    Result,
} from './resultCollector';

export class TestCustomConsumer extends CustomConsumer {
    public constructor(
        protected readonly id: string,
        protected readonly collectResult: CollectResult,
        protected readonly consumerStrategy: ConsumerStrategy<Message>,
    ) {
        super(consumerStrategy);
    }

    protected processMessage(message: Message): void {
        console.log('HERE');

        const data = message.data.toUpperCase();

        const result: Result = {
            consumerId: this.id,
            data,
        };

        this.collectResult(result);
    }

}
