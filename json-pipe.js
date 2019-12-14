const EventEmitter = require("events");

/**
 * A WebSocket impersonator to provide the appearance of cross-process IPC
 */
class JSONPipe extends EventEmitter {
	constructor() {
		super();
	}

	send(what){
		const encoded = JSON.stringify(what);
		setTimeout(() => {
			const duplicate = JSON.parse(encoded);
			this.emit("message", duplicate);
		},0);
	}
}

module.exports = {
	JSONPipe
};
