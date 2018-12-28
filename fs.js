/*
 * Parallel
 */

// Node core dependencies
const os = require("os");
const fs = require("fs");
const {promisify} = require("util");

//Convert to promise interfaces
const mkdtemp = promisify(fs.mkdtemp);
const mkdir = promisify(fs.mkdir);
const rmdir = promisify(fs.rmdir);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);
const access = promisify(fs.access);

//Junk Bucket dependencies
const {parallel} = require("./future");

const path = require("path");

//Utilities
async function rmRecursively( target ){
	const stats = await stat( target );
	if( stats.isDirectory() ) {
		const files = await readdir( target );
		await parallel(files.map( async subfile => {
			const fullPath = path.join( target, subfile );
			await rmRecursively( fullPath );
		}));
		await rmdir( target );
	} else {
		await unlink( target );
	}
}

async function makeTempDir( template, base = os.tmpdir() ) {
	const tempPrefix = path.join( base, template);
	const root = await mkdtemp( tempPrefix );
	return root;
}

// const {ENOENT} = require("errors");

async function exists( name ){
	try {
		await access(name, fs.constants.F_OK);
		console.error("Access");
		return true;
	}catch(e){
		if( e.error == Error.ENOENT ){
			return false;
		} else {
			throw  e;
		}
	}
}

module.exports = {
	//Promise adapters
	access,
	mkdtemp,
	mkdir,
	rmdir,
	readdir,
	stat,
	unlink,

	//Extensions
	exists,
	rmRecursively,
	makeTempDir
};
