
function first( from, count = 10 ){
	return [].concat(from).splice(0, count);
}

function last( from, count = 10 ){
	return [].concat(from).splice(from.length - count, count);
}

module.exports = {
	first,
	last
};
