declare module "junk-bucket/future" {
  export class Future<T> {
    public promised: Promise<T>;

    constructor();

    public accept(value: T): void;

    public reject(value: any): void;
  }

  export function delay(ms: number): Future<void>;

  interface EventHandler {
    (event: any): void
  }

  export interface OnceEmitter {
    once(eventName: string, handler: EventHandler): any
  }

  export function promiseEvent(from: OnceEmitter, eventName: string): Future<any>;
}
