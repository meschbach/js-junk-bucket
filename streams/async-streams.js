const {Readable,Writable} = require("stream");

class AsyncWritable extends Writable {
	constructor(properties) {
		super(properties);
	}

	_write(chunk, encoding, callback) {
		const promise = this._doWrite(chunk,encoding);
		promise.then(() => {
			callback(null);
		}, (e) => {
			callback(e);
		})
	}

	async _doWrite(chunk, encoding) {
		throw new Error("Not implemented");
	}
}

class AsyncSingleRead extends Readable {
	constructor(properties) {
		super(properties);
	}

	_read(size) {
		const promise = this._doRead(size);
		Promise.resolve(promise).then((result) => {
			this.push(result);
		}, (e) => {
			this.emit("error", e);
		});
	}

	async _doRead(size) {
		throw new Error("Not implemented");
	}
}

module.exports = {
	AsyncWritable,
	AsyncSingleRead
};
