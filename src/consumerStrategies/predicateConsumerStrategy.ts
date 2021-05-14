import type { Logger } from "pino";
import type { Message } from "../message";
import { ConsumerStrategy } from "./consumerStrategy";
import { MessageProcessingError } from "../abstractCustomConsumer";

class MessageHasTooLowPriority extends MessageProcessingError {}

export class PredicateConsumerStrategy implements ConsumerStrategy<Message> {
    private readonly logger: Logger;

    public constructor(
        parentLogger: Logger,
        protected readonly notAcceptedData: string,
        protected readonly maxPredicateRunCount: number,
    ) {
        this.logger = parentLogger.child({ class: this.constructor.name });
    }

    public assertCanProcessMessage(message: Message): void {
        this.logger.debug({ message }, "Asserting if the consumer can process this message");

        if (message.data === this.notAcceptedData && message.predicateRunCount < this.maxPredicateRunCount) {
            throw new MessageHasTooLowPriority();
        }
    }

    public buildPostponedMessage(message: Message, error: MessageProcessingError): Message {
        this.logger.debug({ message, error }, "Building a postponed message");

        return {
            ...message,
            predicateRunCount: message.predicateRunCount + 1,
        };
    }
}
