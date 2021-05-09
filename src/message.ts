import * as t from "io-ts";
import { withFallback } from "io-ts-types";

export const buildRetCodec = <T extends t.Props>(props: T): t.ReadonlyC<t.ExactC<t.TypeC<T>>> =>
    t.readonly(t.exact(t.type(props)));

export const messageCodec = buildRetCodec({
    data: t.string,
    ttl: withFallback(t.number, 3),
    priority: withFallback(t.number, 5),
    predicateRunCount: withFallback(t.number, 0),
});

export type Message = t.TypeOf<typeof messageCodec>;


