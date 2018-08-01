/*
 * Adapted from WebGiraffe
 */

const { nope } = require('./index')

class CommandDispatcher {
	constructor( defaultHandler = nope ) {
		this.handlers = []
		this.defaultHandler = defaultHandler
	}

	register( name, handler ) {
		this.handlers[name] = handler
	}

	unregister( name ){
		this.handlers[name] = undefined
	}

	dispatch( message, context ){
		const targetName = message.command
		const handler = this.handlers[targetName] || this.defaultHandler
		handler( message, context )
	}

	once( name, handler ) {
		this.register( name, function( message, context ) {
			this.unregister( name )
			handler( message, context )
		})
		return name
	}

	reset(){
		this.handlers = {};
	}
}

module.exports = {
	CommandDispatcher
};
