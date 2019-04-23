
const {nope} = require("./index");

const defaultNullLogger = Object.freeze({
	info: nope,
	error: nope,
	debug: nope,
	warn: nope,
	trace: nope,
	child: function() { return Object.freeze(Object.assign({}, defaultNullLogger)); }
});

class CapturingLogger {
	constructor(){
		this.messages = {
			debug: [],
			error: [],
			info: [],
			warn: [],
			trace: []
		};
	}

	debug(...args){ this.messages.debug.push(args); }
	error(...args){ this.messages.error.push(args); }
	info(...args){ this.messages.info.push(args); }
	warn(...args){ this.messages.warn.push(args); }
	trace(...args){ this.messages.trace.push(args); }
	child() { return this; }
}

module.exports = {
	defaultNullLogger,
	CapturingLogger
};
