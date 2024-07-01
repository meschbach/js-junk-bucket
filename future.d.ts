declare module "junk-bucket/future" {
  export class Future<T> {
    /**
     * resolved indicates the promise has been resolved.  Used for correctness internally.  Could be used to construct
     * gates.
     */
    public readonly resolved: boolean;
    public promised: Promise<T>;

    constructor();

    public accept(value: T): void;

    public reject(value: any): void;
  }

  /**
   * Provides a future which will be resolved after ms .  Caveat on all browser setTimeout/setInterval issues.
   * @param ms number of milliseconds to delay
   * @param value the value to be returned after the delay
   */
  export function delay<T>(ms: number, value?:T): Promise<T>;

  interface EventHandler {
    (event: any): void
  }

  export interface OnceEmitter {
    once(eventName: string, handler: EventHandler): any
  }

  export function promiseEvent(from: OnceEmitter, eventName: string): Future<any>;
}
