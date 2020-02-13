
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

function filterEnvelope(low,high, element){
	return function(o){
		const value = element(o);
		return low <= value &&  value <= high;
	}
}

function y(...fns){
	return function (input) {
		return fns.reduce((value,fn) => fn(value), input);
	}
}

function append(prototype) {
	return function (input) {
		return Object.assign({}, input, prototype);
	}
}

function sortHigh( element ){
	return function (lhs,rhs) {
		return element(rhs) - element(lhs);
	}
}

function above( threshold, element){
	return function (input) {
		return threshold < element(input);
	}
}

function truthy(input){ return !!input }

module.exports = {
	above,
	arg2,
	append,
	filterEnvelope,
	identity,
	property,
	sortHigh,
	truthy,
	y
};