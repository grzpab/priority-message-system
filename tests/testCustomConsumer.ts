import type { Logger } from "pino";
import type { Message } from "src/message";
import type {
    CollectResult,
    Result,
} from "./resultCollector";
import { ConsumerStrategy } from "../src/consumerStrategies/consumerStrategy";
import { CustomConsumer } from "../src/customConsumer";

export class TestCustomConsumer extends CustomConsumer {
    public constructor(
        readonly parentLogger: Logger,
        protected readonly id: string,
        protected readonly collectResult: CollectResult,
        protected readonly consumerStrategy: ConsumerStrategy<Message>,
    ) {
        super(parentLogger, consumerStrategy);
    }

    protected processMessage(message: Message): void {
        this.logger.debug({ message }, "Processing a message");

        const data = message.data.toUpperCase();

        const result: Result = {
            consumerId: this.id,
            data,
        };

        this.collectResult(result);
    }

}
