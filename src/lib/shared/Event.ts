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

export class Event<T> implements IEvent<T> {
    private handlers: IEventHandler<T>[] = [];

    public on(handler: IEventHandler<T>) {
        this.handlers.push(handler);
    }

    public off(handler: IEventHandler<T>) {
        this.handlers = this.handlers.filter(h => h !== handler);
    }

    public trigger(data?: T) {
        this.handlers
            .slice(0)
            .forEach(h => h(data));
    }
}

/**
 * Throttles event.
 * @param callback Event handler
 * @param limit Limit in milliseconds
 */
export function throttle(callback: (e: any) => void, limit: number) {
    let wait = false;
    return (e: any) => {
        if (!wait) {
            callback(e);
            wait = true;
            setTimeout(() => { wait = false; }, limit);
        }
    };
}
