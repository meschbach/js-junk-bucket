declare module "junk-bucket" {
  /**
   * An adapter from the standard (error, result) NodeJS callback style.
   *
   * At this point you should probably prefer to use the builtin node promises for the callbacks.  Still useful for
   * wrapping external libraries who do not yet have callbacks.
   *
   * @callback wrap Accepts a callback to interpret the success/callback of the NodeJS style
   * @returns a promise to be resolved when the callback passed to perform function resolves.
   */
  export function es6_node<T>(wrap: (err: any, value: T) => void): Promise<T>;

  /**
   * nope - does nothing.  literally.
   */
  export function nope(): void;

  interface Logger {
    log(...args: any[]): void;

    error(...args: any[]): void;
  }

  /**
   * Wraps the given operation and logs failures of the promise.  This is primarily intended to provide async entry points
   * to avoid having to re-write the this for every command
   *
   * @param perform An async function to be resolved or logged
   * @param logger Logger to be passed to the performer and target when the application fails
   */
  function main(perform: (logger: Logger) => Promise<any>, logger ?: Logger);
}
