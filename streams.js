const Future = require("./future");

function promisePiped( from, to ){
	const future = new Future();

	function remove() {
		from.off("end", accept);
		from.off("error", reject);
		to.off("error", reject);
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
