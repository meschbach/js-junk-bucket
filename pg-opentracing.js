const {globalTracer, initGlobalTracer} = require("opentracing");
const pg = require("pg");

/**
 * Wraps a Postgres pool to add tracing to a Postgres connection pool
 */
class TracedDB {
	constructor( db, parentSpan, tags, config = {} ){
		this.db = db;
		this.tracer = globalTracer();
		this.parentSpan = parentSpan;
		this.tags = tags;
	}

	async _query( parentSpan, query, params ){
		const querySpan = this.tracer.startSpan(query, {
			childOf: parentSpan,
			tags: Object.assign({"db.statement" : query}, this.tags)
		});
		try {
			const resultSet = await this.db.query(query, params);
			return resultSet;
		}catch(e){
			querySpan.log(e.message);
			querySpan.setTag("error", true);
			querySpan.setTag("sampling.priority", 1);
			const error =  new Error(e.message + " in query '"+ query + "'");
			error.cause = e;
			error.originalStack = e.stack;
			throw error;
		}finally {
			querySpan.finish();
		}
	}

	async query( query, params ){
		return await this._query( this.parentSpan, query, params );
	}

	async parallelQueries( name, queries ){ //TODO: Doesn't actually conform to `pg` library.  Is this the correct place?
		const encapsulatingSpan = this.tracer.startSpan( name, {childOf: this.parentSpan });
		const results = await parallel( queries.map( async (q) => {
			return await this._query(encapsulatingSpan, q.query, q.params );
		}) );
		encapsulatingSpan.finish();
		return results;
	}

	subspan( parent ){
		return new TracedDB(this.db, parent, this.tags);
	}
}

function tracedPool( db, parent ){
	const tags = {
		"component": "pg",
		"db.instance": db.options.database || process.env["PGDATABASE"] || pg.defaults.database,
		"db.type" : "postgres",
		"db.user" : db.options.user,
		"peer.address" : db.options.host || pg.defaults.host,
		"peer.hostname" : db.options.host || pg.defaults.host,
		"peer.port" : db.options.port || pg.defaults.port,
		"span.kind" : "client"
	};
	return new TracedDB(db, parent, tags);
}

module.exports = {
	TracedDB,
	tracedPool
};
