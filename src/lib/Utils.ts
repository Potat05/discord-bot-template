import { EventDispatcher } from "./EventDispatcher";



export function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}



export class SingularItemQueue<T> extends EventDispatcher<{
    next: (item: T) => unknown;
    skip: (item: T) => unknown;
}> {

    private next?: T;
    public readonly delay: number;
    private timeout: any;
    private nextMinTime: number = -Infinity;

    constructor(delay: number = 1000) {
        super();

        this.delay = delay;
    }

    private tick(): void {
        const now = Date.now();
        clearTimeout(this.timeout);

        if(now < this.nextMinTime) {

            this.timeout = setTimeout(() => this.tick(), this.nextMinTime - now);
            
        } else if(this.next !== undefined) {

            this.nextMinTime = now + this.delay;
            this.dispatchEvent('next', this.next);

        }

    }

    public queue(item: T): void {
        if(this.next !== undefined) {
            this.dispatchEvent('skip', this.next);
        }
        this.next = item;
        this.tick();
    }

    public skip(): void {
        const now = Date.now();

        if(this.next !== undefined) {
            this.dispatchEvent('skip', this.next);
        }
        this.next = undefined;

        clearTimeout(this.timeout);
        this.nextMinTime = now + this.delay;
    }
    
}


