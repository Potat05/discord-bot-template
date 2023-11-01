


let global_dispatcher_id = 0;



export abstract class EventDispatcher<T extends {[key: string]: (...data: any[]) => void}> {

    private destroyed: boolean = false;

    private listeners: Map<keyof T, {
        callbackfn: T[keyof T];
        id: number;
        once: boolean;
    }[]> = new Map();

    public addEventListener<K extends keyof T>(key: K, callbackfn: T[K], once: boolean = false): number {

        if(this.destroyed) {
            throw new Error('Usage of event dispatcher after being destroyed.');
        }

        if(!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }

        this.listeners.get(key)?.push({
            callbackfn,
            once,
            id: global_dispatcher_id
        });

        return global_dispatcher_id++;

    }

    public removeEventListener<K extends keyof T>(key: K, callbackfn: T[K], once: boolean): boolean;
    public removeEventListener(id: number): boolean;
    public removeEventListener(): boolean {

        if(this.destroyed) {
            throw new Error('Usage of event dispatcher after being destroyed.');
        }

        if(typeof arguments[0] == 'number') {

            for(const listeners of this.listeners.values()) {

                for(let i = 0; i < listeners.length; i++) {

                    const listener = listeners[i];

                    if(listener.id == arguments[0]) {
                        listeners.splice(i, 1);
                        return true;
                    }

                }

            }

            return false;

        } else {

            const key = arguments[0] as string;
            const callbackfn = arguments[1];
            const once = arguments[2] as boolean;

            const listeners = this.listeners.get(key);

            if(listeners === undefined) return false;

            for(let i = 0; i < listeners.length; i++) {

                const listener = listeners[i];

                if(listener.callbackfn === callbackfn && listener.once === once) {
                    listeners.splice(i, 1);
                    return true;
                }

            }

            return false;

        }

    }

    public dispatchEvent<K extends keyof T>(key: K, ...args: Parameters<T[K]>): void {

        if(this.destroyed) {
            throw new Error('Usage of event dispatcher after being destroyed.');
        }

        const listeners = this.listeners.get(key);

        if(listeners === undefined) return;

        listeners.forEach(listener => {

            listener.callbackfn(...args);

            if(listener.once) {
                this.removeEventListener(key, listener.callbackfn, listener.once);
            }

        });

    }

    public destroyDispatcher(): void {

        if(this.destroyed) {
            throw new Error('Usage of event dispatcher after being destroyed.');
        }

        this.destroyed = true;

        this.listeners.forEach((_, key) => {
            this.listeners.delete(key);
        });

    }

}

