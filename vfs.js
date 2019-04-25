/**
 * @module vfs
 *
 * Virtual File System
 *
 * Provides a framework to abstract out operating against the local file system or a remote file system.  This is useful
 * in testing, distributed portability, or vendor independence.
 */

/**********************************************************
 * Local VFS
 **********************************************************/

const fs = require("fs");
const {
	exists,
	unlink,
	readFile,
	writeFile
} = require("./fs");

class LocalFileSystem {
	async exists( file ){
		return await exists(file);
	}

	async unlink( file ){
		return await unlink(file);
	}

	async createReadableStream( file ){
		return fs.createReadStream(file);
	}

	async createWritableStream( file ){
		return fs.createWriteStream(file);
	}

	async asBytes( file ){
		return await readFile( file );
	}

	async putBytes( file, bytes, encoding ){
		await writeFile(file, bytes, {encoding});
	}
}


/**********************************************************
 * In Memory VFS
 **********************************************************/
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


/**********************************************************
 *
 **********************************************************/
const path = require("path");

function jailedPath( root, relative ){
	const relativeNormalized = path.normalize(relative);
	const resolvedPath = path.resolve(root, relativeNormalized);
	const relativeResult = path.relative(root, resolvedPath);
	const actualParts = relativeResult.split(path.sep).filter((c) => c != "..");
	return [root].concat(actualParts).join(path.sep);
}


/**********************************************************
 *
 **********************************************************/

class JailedVFS {
	constructor(root, vfs) {
		this.root = root;
		this.vfs = vfs;
	}

	async exists( file ){
		const fileName = jailedPath(this.root, file);
		return await this.vfs.exists(fileName);
	}

	async unlink( file ){
		const fileName = jailedPath(this.root, file);
		return await this.vfs.unlink(fileName);
	}

	async createReadableStream( file ){
		const fileName = jailedPath(this.root, file);
		return await this.vfs.createReadableStream(fileName);
	}

	async asBytes( file ){
		const fileName = jailedPath(this.root, file);
		return await this.vfs.asBytes(fileName);
	}

	async putBytes( file, bytes, encoding ){
		const fileName = jailedPath(this.root, file);
		return await this.vfs.putBytes(fileName);
	}

	async createWritableStream( file ){
		const fileName = jailedPath(this.root, file);
		return await this.vfs.createWritableStream(fileName);
	}
}

/**********************************************************
 *
 **********************************************************/
module.exports = {
	InMemoryVFS,
	jailedPath,
	JailedVFS,
	LocalFileSystem
}
