import { Logger } from 'pino';
import { ConsumerStrategy } from "./consumerStrategy";
import { Message } from "../message";
import { MessageProcessingError } from "../abstractCustomConsumer";

class MessageHasTooLowPriority extends MessageProcessingError {}

export class PriorityConsumerStrategy implements ConsumerStrategy<Message> {
    private readonly logger: Logger;

    public constructor(
        parentLogger: Logger,
        private readonly priority_threshold: number,
    ) {
        this.logger = parentLogger.child({ class: this.constructor.name });
    }

    public assertCanProcessMessage(message: Message): void {
        this.logger.debug({ message }, 'Asserting if the consumer can process this message');

        if (message.priority < this.priority_threshold) {
            throw new MessageHasTooLowPriority();
        }
    }

    public buildPostponedMessage(message: Message, error: MessageProcessingError): Message {
        this.logger.debug({ message, error }, "Building a postponed message");

        const modifier = error instanceof MessageHasTooLowPriority ? 1 : -1;

        return {
            ...message,
            priority: message.priority + modifier,
        };
    }
}
