import { ConsumerStrategy } from "./consumerStrategy";
import { Message } from "../message";
import { MessageProcessingError } from "../abstractCustomConsumer";

class MessageHasTooLowPriority extends MessageProcessingError {}

export class PriorityConsumerStrategy implements ConsumerStrategy<Message> {
    public constructor(
        private readonly priority_threshold: number,
    ) {
    }

    public assertCanProcessMessage(message: Message): void {
        if (message.priority < this.priority_threshold) {
            throw new MessageHasTooLowPriority();
        }
    }

    public buildPostponedMessage(message: Message, error: MessageProcessingError): Message {
        const modifier = error instanceof MessageHasTooLowPriority ? 1 : -1;

        return {
            ...message,
            priority: message.priority + modifier,
        };
    }
}
