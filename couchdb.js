/**
 * @module couchdb
 */

const assert = require("assert");
const nano = require( "nano" );
const { es6_node } = require( './index' );
const {AsyncSingleRead} = require("./streams/async");

class ReadCouchDocuments extends AsyncSingleRead {
	constructor(client, set) {
		super({
			objectMode:true
		});
		this.client = client;
		this.documentSet = set;
		this.index = 0;
	}

	async _doRead() {
		const index = this.index;
		if( this.index >= this.documentSet.length ){
			this.emit("end");
			return;
		}
		this.index++;

		const docID = this.documentSet[index];
		const document =  await this.client.get_by_id(docID);
		return document;
	}
}

/**
 * A single CouchDB instance to communicate with over a well defined URL.  Exposes asynchronous management of database
 * wide operations such as manipulating databases.
 *
 * @type CouchDB.Service
 */
class Service {
	/**
	 * Declares a new service to attempt to communicate with
	 * @param {string} host the URL of the CouchDB instnaces to be communciated with
	 */
	constructor( host = "http://localhost:5984" ){
		this.client = nano( host )
	}

	/**
	 * Creates a new database if the database doesn't exist.  If the database does exist it's considered an error
	 *
	 * @param name {string} Name of the database to be created
	 * @return {Promise} completed when the database is created
	 * @throws Error if the database exists
	 */
	create_db( name ) {
		return es6_node( (cb ) => this.client.db.create( name, cb ) )
	}

	/**
	 * Enumerates all databases within the represenetd CouchDB system
	 * @return {Promise<Array<String>>} the names of the database existing within the represented CouchDB service
	 */
	list_dbs(){
		return es6_node( ( cb ) => this.client.db.list( cb ) )
	}

	/**
	 * Creates a new database by the given name if it doesn't exist, otherwise returns a wrapper around the database
	 *
	 * @return {Promise<Database>} a promise for the database representation
	 */
	async ensure_db_exists( name ){
		assert(name);

		const dbs = await this.list_dbs();
		if( !dbs.includes(name) ){
			await this.create_db( name )
		}
		return new Database( this.client.use( name ) )
	}
}

/**
 * Encapsulates the CouchDB operations.
 *
 * @interface
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
	 * @return {Promise) A promise to resolve the document or null if the document doesn't exist.
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

	async view( design, name, params ){
		return await this.client.view( design, name, params );
	}

	async streamViewResults( design, name, params ){
		const viewResults = await this.view( design, name, params );
		const viewDocumentsIDs = viewResults.rows.map((r) => r.id);
		return new ReadCouchDocuments(this, viewDocumentsIDs);
	}

	/**
	 * Retrieves the given document by ID, then modifies the document, then writes the document back.
	 *
	 * @param id {String} the ID of the document to be modified
	 * @param modifier { function( originalDocument ) = Promise} a function to promise a modified document
	 * @return a promise to update the given document
	 */
	async update_by_id( id, modifier ){
		const document = await this.get_by_id( id );
		const modified = await modifier( document );
		return await this.insert( modified )
	}

	/**
	 * Updates the document if it exists or inserts the given document if the document doesn't exist
	 *
	 * @param id {String} the _id of the document to be modified
	 * @param generator { function() = Promise } A promise gneerator to create a new document for insert
	 * @param updater { function( originalDocument ) = Promise} a promise generator to modify the original document to be stored
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

	/**
	 * Checks if a document with a given ID exists
	 *
	 * @param id {String} the _id of the document in question
	 * @return true if the document exists, otherwise false
	 */
	async exists( id ){
		const document = await this.maybe_by_id(id);
		return !!document;
	}
}

module.exports = {
	Service,
	Database
};

