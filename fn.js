
function identity(i) {
	return i;
}

function property(name){
	return function(obj){
		return obj[name];
	}
}

function arg2(_arg1, arg2){
	return arg2;
}

module.exports = {
	identity,
	property,
	arg2
};