# Change Log
## Next

## v1.4.0
* *Breaking* [Future](future.js) has changed from being the object returned from the module to a component.  To update
you'll need to update from
```javascript
const Future = require("junk-bucket/future");
```
to
```javascript
const {Future} = require("junk-bucket/future");
```
* [streams](streams) for eveyone!  Utilities to [skip elements](streams/skips.js), [gather elements](streams/gather.js),
and [otherwise make life easier](streams/junk.js).
* [Many functions](fn.js) have been added.  Including a `y` combinator type function.
* OpenTracing wrappers for [Postgres](pg-opentracing.js) and [Express](express-opentracing.js).
* [Logging Morgan to an a Context for the request](express-morgan.js).

## v1.3.0
* [Length Prefixed Frames](streams/network-length-frame.js)
* [SHA256 digest](crypto.js)
* [`async listen` for addreses](sockets.js) to retrieve an anonymous bind.
* [`JailedVFS`](vfs.js) for only exposing a sub-filesystem to a client.  From Irrigation.
* [`Dispatcher` for command routing](command-dispatcher.js) for building more complicated multiplexed services.  Extracted
from and a generalization of WebGiraffe's implementation.
* [`RPC` service and client](rpc.js) providing basic RPC services acrossed a message system.  This is useful for things
like WebSockets.
* [`JSONPipe`](json-pipe.js) for mimicking IPC with tests.

## v1.2.1 - Smaller Artifact
* Removed `esdocs` generated artifacts from the NPM upload.

## v1.2.0 - All the streams!
*Features*
* async-express: Adds `a_all` method.
* events: Memory Event store for testing & tests
* streams: `EchoOnReceive` class for debugging to a logger
* streams: `MemoryReadable` to simulate a readable stream from a buffer
* streams: `MemoryWritable` to capture a byte buffer from a stream
* vfs: `InMemoryVFS` for in-memory file like semantics.  Quick testing for fun and profit
* vfs: Generic VFS tests to ensure similar behavior.

*Bugs*
* streams: `promisePiped` is complete on write `finish`, not read `end`.

*CI*
* Trying out [EsDoc](https://doc.esdoc.org/github.com/meschbach/js-junk-bucket/).  Still needs work.
* Coveralls.  Still needs more work.

## v1.1.1
*Bug Fix*
* Bunyan Console logger: Avoid name duplication

## v1.1.0
*Features*
* async main: Use exist code -1 when an exception bubbles all the way up.
* logger/bunyan: Formatted console output optionally disables color, or whenever not connected to a TTY
* context: Adds Context to automate destruction of resources
* context: Temporary directory scoped to the context
* context: Subcontexts
* express: Async aware Router
* fs/async: Wraps readFile
* fn: identity function
* logging: CaptureLogger to capture logging
* validation: Able to validate an object for strings or integers

*Misc*
* [Travis CI](https://travis-ci.org/meschbach/js-junk-bucket) build badge
* Change Log

