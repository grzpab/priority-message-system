import { AbstractCustomConsumer } from "./abstractCustomConsumer";
import { Message, messageCodec } from "./message";
import { isLeft } from "fp-ts/Either";

export abstract class CustomConsumer extends AbstractCustomConsumer<Message> {
    public decodeMessage(encodedMessage: string): Message {
        const validation = messageCodec.decode(JSON.parse(encodedMessage));

        if (isLeft(validation)) {
            throw new Error(`validation failed ${validation.left.toString()}`);
        }

        return validation.right;
    }

    public encodeMessage(message: Message): string {
        return JSON.stringify(message);
    }
}
