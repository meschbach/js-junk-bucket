const Future = require("./future");

const {Readable, Transform, Writable} = require("stream");
const {LengthPrefixedFrameIngress, LengthPrefixedFrameEgress} = require("./streams/network-length-frame");

function promisePiped( from, to ){
	const future = new Future();

	function remove() {
		from.removeListener("end", accept);
		from.removeListener("error", reject);
		to.removeListener("error", reject);
	}
	function reject(e){
		remove();
		future.reject(e);
	}
	function accept(v){
		remove();
		future.accept(v);
	}

	from.on("error", reject);
	to.on("error", reject);

	to.on("finish", accept);
	from.pipe(to);
	return future.promised;
}

class EchoOnReceive extends Transform {
	constructor( log = console ){
		super();
		this.log = log;
	}
	_transform( chunk, encoding, cb ) {
		this.log.log("Chunk", chunk);
		cb(null,chunk);
	}

	_final(cb){
		this.log.log("Final called");
		cb();
	}
}

/**
 * A readable which will provide a given buffer on the first read attempt then appear closed on all further attempts.
 */
class MemoryReadable extends Readable {
	/**
	 *
	 * @param source {Buffer} bytes to be provided
	 * @param props additional properties to be passed to Readable
	 */
	constructor(source, props) {
		super(props);
		this.bytes = source;
		this.pushed = false;
	}

	_read( size ){
		if( !this.pushed ) {
			this.pushed = true;
			this.push(this.bytes);
		} else {
			this.readable = false;
			this.push(null);
		}
	}
}

/**
 * Accumulates bytes written to the sink.  This sink is never finished or finalized.
 */
class MemoryWritable extends Writable {
	/**
	 * Initializes an empty buffer with the provided properties.
	 *
	 * @param props properties to provide to the writable
	 */
	constructor(props) {
		super(props);
		this.bytes = Buffer.alloc(0);
	}

	_write(chunk, encoding, callback) {
		try {
			this.bytes = Buffer.concat([this.bytes, chunk]);
			callback(null);
		}catch(e){
			callback(e);
		}
	}
}

module.exports = {
	promisePiped,
	EchoOnReceive,
	LengthPrefixedFrameIngress, LengthPrefixedFrameEgress,
	MemoryReadable,
	MemoryWritable
};
