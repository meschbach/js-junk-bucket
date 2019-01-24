/**
 * Provides a simple control structure to allow for composition of destruction operation.
 *
 * For example: when creating a temporary directory this may register to cleanup said directory
 */
class Context {
	constructor(name, logger){
		this.name = name;
		this.logger = logger;
		this.toCleanup = [];
	}

	/**
	 * Creates a subcontext with the given name.
	 *
	 * @param name the name of the subcontext
	 */
	subcontext( name ){
		const subname = this.name + "/"+ name;
		const newLogger = this.logger.child({subcontext: subname});
		const subcontext = new Context(subname, newLogger);
		this.onCleanup( async function() {
			await subcontext.cleanup();
		});
		return subcontext;
	}

	onCleanup( f ){
		this.toCleanup.unshift(f);
	}

	async cleanup(){
		for( const f of this.toCleanup ){
			try {
				await f(this);
			}catch( e ){
				this.logger.error("Failed to cleanup", e);
			}
		}
	}
}

module.exports = {
	Context
};
