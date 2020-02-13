const {Transform} = require("stream");

class NewLineFramed extends Transform {
	constructor(options) {
		super({
			writableObjectMode: true
		});
		this.pendingBuffer = Buffer.alloc(0);
	}

	_transform(data, encoding, callback){
		this.pendingBuffer = Buffer.concat([this.pendingBuffer, data]);

		// Use string split to extract the new lines
		const asString = this.pendingBuffer.toString("utf-8");
		const allFrames = asString.split("\n");
		const complete = allFrames.slice(0, allFrames.length - 2);
		complete.forEach((f) => {
			this.push(f);
		});

		//Figure out how many bytes we have remaining in the buffer
		const lastChunk = allFrames[allFrames.length - 1];
		const byteCount = Buffer.byteLength(lastChunk, 'utf8');
		const startCount = this.pendingBuffer.length - byteCount - 1;
		this.pendingBuffer = this.pendingBuffer.slice(startCount);

		callback();
	}

	_flush(callback){
		if( this.pendingBuffer.length > 0 ){
			this.push(this.pendingBuffer);
			this.pendingBuffer = Buffer.alloc(0);
		}
		callback();
	}
}

module.exports = {
	NewLineFramed
};
