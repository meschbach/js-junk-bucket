/*
 * Parallel
 */

// Node core dependencies
const os = require("os");
const fs = require("fs");
const {promisify} = require("util");

//Convert to promise interfaces
const access = promisify(fs.access);
const mkdtemp = promisify(fs.mkdtemp);
const mkdir = promisify(fs.mkdir);
const rmdir = promisify(fs.rmdir);
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);
const writeFile = promisify(fs.writeFile);

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

/**
 * Creates a new temporary directory scoped to the given context.  Once the context is cleaned up the temporary
 * directory will be deleted.
 *
 * @param context The context to be attached to
 * @param template Temporary directory template to utilize
 * @returns {Promise<string>} The path to the temporary directory
 */
async function contextTemporaryDirectory( context, template ){
	const dir = await makeTempDir(template);
	context.onCleanup(async function () {
		await rmRecursively(dir);
	});
	return dir;
}

module.exports = {
	//Promise adapters
	access,
	mkdtemp,
	mkdir,
	rmdir,
	readdir,
	readFile,
	stat,
	unlink,
	writeFile,

	//Extensions
	exists,
	rmRecursively,
	makeTempDir,
	contextTemporaryDirectory
};
