import { MessageProcessingError } from "../abstractCustomConsumer";
import { ConsumerStrategy } from "./consumerStrategy";
import type { Message } from "../message";

class MessageHasHighTtlError extends MessageProcessingError {}
class MessageHasLowTtlError extends MessageProcessingError {}

export class TtlConsumerStrategy implements ConsumerStrategy<Message> {
    public constructor(
        protected readonly lowTtl: number,
        protected readonly highTtl: number,
    ) {}

    public assertCanProcessMessage(message: Message): void {
        console.log('message', message);

        if (message.ttl <= this.lowTtl) {
            throw new MessageHasLowTtlError();
        }

        if (message.ttl >= this.highTtl) {
            throw new MessageHasHighTtlError();
        }
    }

    public buildPostponedMessage(message: Message, error: MessageProcessingError): Message {
        if (error instanceof MessageHasLowTtlError) {
            throw error;
        }

        return {
            ...message,
            ttl: message.ttl - 1
        };
    }
}
