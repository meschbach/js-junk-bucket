/*
 * Provides facilities related to Postgres, including interfacing with Postgres
 */

const pg = require("pg");

/**
 * Ensure a given set of migrations have been applied.
 *
 * @param logger a logger to note states with
 * @param config configuration of the database connection
 * @param {Array<String>} Migrations as a set of strings.  The index is used to create the ID of the migration
 * @returns {Promise<void>} when migrations are complete
 */
async function performMigrations( logger, config, migrations ) {
	const db = new pg.Client( config );
	await db.connect();
	try {
		await db.query("CREATE TABLE IF NOT EXISTS simple_migrations( index INTEGER NOT NULL, applied_at TIMESTAMP NOT NULL )");

		const appliedResults = await db.query( "SELECT index FROM simple_migrations ORDER BY index ASC" );
		const applied = appliedResults.rows.map( function( r ){
			return r.index;
		});
		logger.info( "Applied migrations", applied );
		//TODO: Probably a way to optimize this!
		for( let index = 0; index < migrations.length ; index++ ){
			if( applied.indexOf( index ) != -1 ){
				logger.info("Migration applied", {index});
				continue;
			}

			const migration = migrations[index];
			try {
				logger.info("Applying migration", {index, migration});
				await db.query(migration);
			}catch( e ){
				throw new Error("Failed to apply migration " + index + " (\""+migration+"\") because " + e.toString() );
			}
			await db.query("INSERT INTO simple_migrations ( index, applied_at ) VALUES( $1, now() )", [index]);
		}
	} finally {
		db.end();
	}
}

module.exports = {
	performMigrations
};
