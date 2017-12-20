/*
 * Adapted from WebGiraffe
 */

const { nope } = require('./index')

class CommandDispatcher {
	constructor() {
		this.handlers = []
		this.defaultHandler = nope
	}

	register( name, handler ) {
		this.handlers[name] = handler
	}

	unregister( name ){
		this.handlers[name] = undefined
	}

	dispatch( message, context ){
		const targetName = message.command
		const handler = this.handlers[name] || this.defaultHandler
		handler( message, context )
	}

	once( name, handler ) {
		this.register( name, function( message, context ) {
			this.unregister( name )
			handler( message, context )
		})
		return name
	}
}
