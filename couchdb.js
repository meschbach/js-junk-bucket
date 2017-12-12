const nano = require( "nano" )
const { es6_node } = require( './index' )

/**
 * A single CouchDB instance to communicate with over a well defined URL.  Exposes asynchronous management of database
 * wide operations such as manipulating databases.
 *
 * @type CouchDB.Service
 */
class Service {
	/**
	 * Declares a new service to attempt to communicate with
	 * @param host the URL of the CouchDB instnaces to be communciated with
	 */
	constructor( host = "http://localhost:5984" ){
		this.client = nano( host )
	}

	/**
	 * Creates a new database if the database doesn't exist.  If the database does exist it's considered an error
	 *
	 * @param name Name of the database to be created
	 * @return {Promise} completed when the database is created
	 * @throws Error if the database exxists
	 */
	create_db( name ) {
		return es6_node( (cb ) => this.client.db.create( name, cb ) )
	}

	/**
	 * Enumerates all databases within the represenetd CouchDB system
	 * @return {Promise<Collection<String>>} the names of the database existing within the represented CouchDB service
	 */
	list_dbs(){
		return es6_node( ( cb ) => this.client.db.list( cb ) )
	}

	/**
	 * Creates a new database by the given name if it doesn't exist, otherwise returns a wrapper around the database
	 *
	 * @return {Promise<CouchDB.Database>} a promise for the database representation
	 */
	async ensure_db_exists( name ){
		const dbs = await this.list_dbs()
		if( !dbs.includes(name) ){
			await this.create_db( name )
		}
		return new Database( this.client.use( name ) )
	}
}

/**
 * Encapsulates the CouchDB operations.
 */
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

	/**
	 * Locates the given document by ID if it exists, otherwise return null
	 *
	 * @param id the _id property of the database to be resolved
	 * @param params optionally additional parameters to send the CouchDB during this operation
	 * @return {Promise<*>) A promise to resolve the document or null if the document doesn't exist.
	 */
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

	/**
	 * Updates the document if it exists or inserts the given document if the document doesn't exist
	 *
	 * @param id {String} the _id of the document to be modified
	 * @param generator { function() = Promise } A promise gneerator to create a new document for insert
	 * @param modfiied { function( originalDocument ) = Promise} a promise generator to modify the original document to be stored
	 * @return the results fo the insert or update
	 */
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
