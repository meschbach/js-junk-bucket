/**
 * @module command-dispatcher
 *
 */
const { nope } = require('./index');

/**
 * Routes to a named handler of some object, otherwise routes to the default handler
 */
class Dispatcher {
	/**
	 * Builds a new handler which by directs all messages to the default handler.
	 * @param defaultHandler {Function} default handler
	 */
	constructor( defaultHandler = nope ) {
		/**
		 * @private
		 */
		this.handlers = {};
		/**
		 * @public
		 * @type {Function}
		 */
		this.defaultHandler = defaultHandler
	}

	/**
	 * Registers dispatching to a specific handler for the given command.
	 * @param name command to be dispatched
	 * @param handler {Function} the handler to dispatch too
	 */
	register( name, handler ) {
		this.handlers[name] = handler
	}

	/**
	 * Removes the handler for the specific command
	 * @param name command to be removed
	 */
	unregister( name ){
		this.handlers[name] = undefined
	}

	/**
	 * Dispatches the given message to the registered handler, otherwise dispatches to the default handler if the
	 * handler can not be found.
	 *
	 * @param targetName target to be dispatched too
	 * @param message message to extract the handler name from and encapsulating the request
	 * @param context invocation context
	 */
	dispatch( targetName, message, context ){
		const handler = this.handlers[targetName] || this.defaultHandler;
		handler( message, context );
	}

	/**
	 * Registers a handler to receive a single message before unsubscribing.
	 *
	 * @param name command to be bound too
	 * @param handler the handler to be invoked
	 * @returns {*} the name of the handler
	 */
	once( name, handler ) {
		this.register( name, ( message, context ) => {
			this.unregister( name );
			handler( message, context )
		});
		return name
	}

	/**
	 * Resets all handlers.
	 */
	reset(){
		this.handlers = {};
	}
}

/**
 * Routes a given message to a specific command handler.
 */
class CommandDispatcher extends Dispatcher {
	/**
	 * Builds a new handler which by directs all messages to the default handler.
	 * @param defaultHandler {Function} default handler
	 */
	constructor( defaultHandler = nope ) {
		super(defaultHandler);
	}

	/**
	 * Dispatches the given message to the registered handler, otherwise dispatches to the default handler if the
	 * handler can not be found.
	 *
	 * @param message message to extract the handler name from and encapsulating the request
	 * @param context invocation context
	 */
	dispatch( message, context ){
		const targetName = message.command;
		super.dispatch(targetName, message, context);
	}
}


/**
 * Monotonically incrementing base 36 radix text.
 */
class Base36Namer {
	/**
	 * Initializes a new namer with the default value or 0
	 * @param start base number to begin with
	 */
	constructor( start = 0 ) {
		this.id = start;
	}

	/**
	 * Generate the next value in the series
	 * @returns {string}
	 */
	next() {
		const id = this.id;
		this.id++;
		return id.toString(36);
	}
}

module.exports = {
	Base36Namer,
	CommandDispatcher,
	Dispatcher
};
