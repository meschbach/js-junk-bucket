const {Transform} = require("stream");

/**
 * Transforms an incoming stream of bytes into a set of discrete frames by interpreting the first two bytes of the next
 * frame a big endian (network) format length.
 */
class LengthPrefixedFrameIngress extends Transform {
	constructor(options, logger) {
		const defaultOptions = Object.assign({}, options, {readableObjectMode: true});
		super(defaultOptions);
		this.pending = Buffer.alloc(0);
		this.logger = logger;
	}

	_transform(chunk, encoding, cb) {
		this.pending = Buffer.concat([this.pending, chunk]);
		while( this.pending.length > 2 ) {
			const size = this.pending.readUInt16BE(0);

			const frame = this.pending.slice(2, size + 2);
			this.push(frame);
			this.pending = this.pending.slice( size + 2 );
		}
		cb();
	}
}


/**
 * For each given frame, it will produce a two byte header in big endian format with the length.  Frames larger than
 * 64KB are unsupported and have undefined behavior.
 */
class LengthPrefixedFrameEgress extends Transform {
	_transform(chunk, encoding, cb) {
		const output = Buffer.alloc(2);
		output.writeUInt16BE(chunk.length);
		this.push(output);
		this.push(chunk);
		cb();
	}
}

module.exports = {
	LengthPrefixedFrameIngress,
	LengthPrefixedFrameEgress
};
