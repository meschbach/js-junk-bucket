# Change Log
## Next

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

