/**
 * @module vfs
 *
 * Virtual File System
 *
 * Provides a framework to abstract out operating against the local file system or a remote file system.  This is useful
 * in testing, distributed portability, or vendor independence.
 */
const {
	MemoryReadable,
	MemoryWritable
} = require("./streams");

class InMemoryVFS {
	constructor() {
		this.files = {};
	}

	async exists( file ){
		return !!this.files[file];
	}

	async _expectFile( file ){
		if( !this.files[file]){
			throw new Error("No such file " + file);
		}
	}

	async unlink( file ){
		if( this.files[file] ){
			delete this.files[file];
		}
	}

	async createReadableStream( file ){
		await this._expectFile(file);
		return new MemoryReadable(this.files[file]);
	}

	async asBytes( file ){
		await this._expectFile(file);
		return Buffer.from(this.files[file]);
	}

	async putBytes( file, bytes, encoding ){
		this.files[file] = Buffer.from(bytes, encoding);
	}

	async createWritableStream( file ){
		const writable = new MemoryWritable();
		writable.on("finish", () => {
			this.files[file] = writable.bytes;
		});
		return writable;
	}
}

module.exports = {
	InMemoryVFS
}