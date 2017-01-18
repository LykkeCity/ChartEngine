/**
 * Typed events for TypeScript.
 */
export interface IEventHandler<T> {
    (arg?: T): void;
}
export interface IEvent<T> {
    on(handler: IEventHandler<T>): void;
    off(handler: IEventHandler<T>): void;
}
export declare class Event<T> implements IEvent<T> {
    private handlers;
    on(handler: IEventHandler<T>): void;
    off(handler: IEventHandler<T>): void;
    trigger(data?: T): void;
}
