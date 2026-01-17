export class Event<T> {
    private subscribedCallbacks: ((arg: T) => void)[] = [];

    subscribe(callback: (arg: T) => void) {
        this.subscribedCallbacks.push(callback);
    }

    unsubscribe(callback: (arg: T) => void) {
        this.subscribedCallbacks.filter(cbk => cbk !== callback);
    }

    invoke(arg: T) {
        this.subscribedCallbacks.forEach(callback => callback(arg));
    }
}