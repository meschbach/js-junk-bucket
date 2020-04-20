/**
 * Provides a construct to attach generic lifecycle events to, such as creation and destruction.
 * @module context
 */

/**
 * @external Logger http://example.com
 */
const assert = require("assert");
const EventEmitter = require("events");

/**
 * Provides a simple control structure to allow for composition of destruction operation.  The primary intent is to ease
 * the burden of deferrable clean up routines.
 *
 * For example: when creating a temporary directory this may register to cleanup said directory
 */
class Context extends EventEmitter {
	/**
	 * Creates a new context with the given name and logger.
	 *
	 * @param name the name of the context
	 * @param logger a logger ot use
	 */
	constructor(name, logger){
		super();
		assert(name);
		assert(logger);
		/**
		 * The name of the context
		 * @type {string}
		 */
		this.name = name;
		/**
		 * Logger for the specific context.
		 * @type {String}
		 */
		this.logger = logger;
		/**
		 * Callbacks for clean up
		 * @private
		 * @type {Array}
		 */
		this.toCleanup = [];
	}

	/**
	 * Creates a subcontext with the given name.
	 *
	 * @param name {String} the name of the subcontext
	 * @returns {Context} a subcontext registered to be cleaned up in order of registration
	 */
	subcontext( name ){
		const subname = this.name + "/"+ name;
		const newLogger = this.logger.child({subcontext: subname});
		const subcontext = new Context(subname, newLogger);
		this.onCleanup( async function() {
			await subcontext.cleanup();
		});

		this.emit("subcontext", {
			name,
			parent: this,
			subcontext
		});
		return subcontext;
	}

	/**
	 * Registers the given callback to be run when cleaning up this context.
	 *
	 * @param f {Function} a callback to be invoked when cleaning up this module.
	 */
	onCleanup( f ){
		this.toCleanup.unshift(f);
	}

	/**
	 * In reverse order sequentially notifies each callback to cleanup the associated resources.
	 *
	 * @returns {Promise<void>} completes when cleanup is completed
	 */
	async cleanup(){
		for( const f of this.toCleanup ){
			try {
				await f(this);
			}catch( e ){
				this.logger.error("Failed to cleanup", e);
			}
		}
		this.toCleanup = [];
	}
}

module.exports = {
	Context
};
