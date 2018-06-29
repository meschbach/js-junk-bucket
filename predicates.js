
function eq( what ){
	return function( obj ){
		return what == obj;
	}
}

module.exports = {
	eq
};
