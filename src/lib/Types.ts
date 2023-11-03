


export type Awaitable<T> = Promise<T> | T;

export type Constructor<T> = new (...args: any[]) => T;

export type PartialDeep<T extends unknown> = T extends {[key: string]: unknown} ? {[Key in keyof T]?: PartialDeep<T[Key]>} : T;

export function isNotNull<T>(value: T | null): value is T {
    return value !== null;
}
