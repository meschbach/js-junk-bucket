const {Dispatcher, Base36Namer} = require("./command-dispatcher");
const Future = require("./future");

class RPCClient {
	constructor(input, output) {
		this.input = input;
		this.input.on("message", (m) => {
			if( m.rpc ){
				const id = m.rpc.id;
				this.dispatcher.dispatch(id, m.rpc );
			}else{
				throw new Error("not RPC");
			}
		});
		this.output = output;
		this.dispatcher = new Dispatcher((...args) => {
			console.log("Error: unknown command", ...args);
		});
		this.idGenerator = new Base36Namer();
	}

	call( what, params, context ){
		const future = new Future();
		const id = this.idGenerator.next();

		this.dispatcher.register(id, (result) => {
			if( result.success ){
				future.accept(result.success);
			}else{
				future.reject(new Error(result.error));
			}
		});
		const call = {rpc: {id: what, params, promise: id }};
		this.output.send(call, context);

		return future.promised;
	}
}

class RPCService {
	constructor(input, output) {
		this.input = input;
		this.input.on("message", (m) => {
			if( m.rpc ){
				this._onCall(m.rpc);
			}else{
				throw new Error("not RPC");
			}
		});
		this.output = output;
		this.dispatcher = new Dispatcher((...args) => {
			console.log("Error: unknown command", ...args);
		});
	}

	_onCall( rpc ){
		const {id,params,promise} = rpc;
		const sendError = (e) => this.output.send({rpc: {id: promise, error: e}});

		try {
			const future = Promise.resolve(this.dispatcher.dispatch(id, params));
			future.then((r) => {
				this.output.send({rpc: {id: promise, success: r}});
			}, (e) => sendError(e));
		} catch (e) {
			sendError(e);
		}
	}

	register(name, handler){
		this.dispatcher.register(name,handler);
	}
}

module.exports = {
	RPCClient,
	RPCService
};