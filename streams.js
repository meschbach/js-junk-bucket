const Future = require("./future");

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


const {Transform} = require("stream");
class EchoOnReceive extends Transform {
	constructor( log = console ){
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

module.exports = {
	promisePiped,
	EchoOnReceive
};
