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
}

exports.Service = Service
