
const {nope} = require("./index");

const defaultNullLogger = Object.freeze({
	info: nope,
	error: nope,
	debug: nope,
	child: function() { return Object.assign({}, defaultNullLogger); }
});

module.exports = {
	defaultNullLogger
}