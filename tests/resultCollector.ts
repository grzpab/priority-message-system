export type Result = {
    consumerId: string,
    data: string,
}

export type CollectResult = (result: Result) => void;
