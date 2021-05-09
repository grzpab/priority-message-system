import { ConsumerStrategy } from "./consumerStrategy";
import { Message } from "../message";
import { MessageProcessingError } from "../abstractCustomConsumer";

class MessageHasTooLowPriority extends MessageProcessingError {}

export class PredicateConsumerStrategy implements ConsumerStrategy<Message> {
    public constructor(
        protected readonly notAcceptedData: string,
        protected readonly maxPredicateRunCount: number,
    ) {
    }

    public assertCanProcessMessage(message: Message): void {
        if (message.data === this.notAcceptedData && message.predicateRunCount < this.maxPredicateRunCount) {
            throw new MessageHasTooLowPriority();
        }
    }

    public buildPostponedMessage(message: Message, error: MessageProcessingError): Message {
        return {
            ...message,
            predicateRunCount: message.predicateRunCount + 1,
        };
    }
}
