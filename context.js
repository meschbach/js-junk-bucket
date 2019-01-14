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
