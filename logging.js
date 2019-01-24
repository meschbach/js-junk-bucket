
const {nope} = require("./index");

const defaultNullLogger = Object.freeze({
	info: nope,
	error: nope,
	debug: nope,
	warn: nope,
	child: function() { return Object.freeze(Object.assign({}, defaultNullLogger)); }
});

class CapturingLogger {
	constructor(){
		this.messages = {
			debug: [],
			error: [],
			info: [],
			warn: []
		};
	}

	debug(...args){ this.messages.debug.push(args); }
	error(...args){ this.messages.error.push(args); }
	info(...args){ this.messages.info.push(args); }
	warn(...args){ this.messages.warn.push(args); }
}

module.exports = {
	defaultNullLogger,
	CapturingLogger
};
