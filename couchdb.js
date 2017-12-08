const nano = require( "nano" )
const { es6_node } = require( './index' )

class Service {
	constructor( host = "http://localhost:5984" ){
		this.client = nano( host )
	}

	create_db( name ) {
		return es6_node( (cb ) => this.client.db.create( name, cb ) )
	}

	list_dbs(){
		return es6_node( ( cb ) => this.client.db.list( cb ) )
	}

	async ensure_db_exists( name ){
		const dbs = await this.list_dbs()
		if( !dbs.includes(name) ){
			await this.create_db( name )
		}
		return new Database( this.client.use( name ) )
	}
}

class Database {
	constructor( client ) {
		this.client = client
	}

	insert( document ) {
		return es6_node( ( cb ) => this.client.insert( document, cb ) )
	}

	get_by_id( id, params ){
		return es6_node( ( cb ) => this.client.get( id, params, cb ) )
	}

	maybe_by_id( id, params ){
		return es6_node( ( cb ) => {
			this.client.get( id, params, ( err, data ) => {
				if( err ) {
					if( err.statusCode == 404 ) { return cb( null, null ) }
					return cb( err )
				} else {
					return cb( err, data )
				}
			})
		})
	}

	view( design, name, params ){
		return es6_node( ( cb  ) => this.client.view( design, name, params, cb ) )
	}

	/**
	 * Retrieves the given document by ID, then modifies the document, then writes the document back.
	 *
	 * @param id {String} the ID of the document to be modified
	 * @param modfiied { function( originalDocument ) = Promise} a function to promise a modified document
	 * @return a promise to update the given document
	 */
	async update_by_id( id, modifier ){
		const document = await this.get_by_id( id );
		const modified = await modifier( document )
		return await this.insert( modified )
	}

	async upsert( id, generator, updater ){
			const document = await this.get_by_id( id )
			if( document ){
				const modified = await updater( document )
				return await this.insert(modified)
			} else {
				const newDoc = await generator()
				return await this.insert(newDoc)
			}
	}
}

exports.Service = Service
