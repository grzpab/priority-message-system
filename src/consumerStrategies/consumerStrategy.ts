import { MessageProcessingError } from "../abstractCustomConsumer";

export interface ConsumerStrategy<M> {
    assertCanProcessMessage(message: M): void;
    buildPostponedMessage(message: M, error: MessageProcessingError): M;
}
