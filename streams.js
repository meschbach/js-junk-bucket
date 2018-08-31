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

	from.on("end", accept);
	from.pipe(to);
	return future.promised;
}

module.exports = {
	promisePiped
};
