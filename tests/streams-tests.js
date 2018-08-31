
const stream = require("stream");
const {promisePiped} = require("../streams");

describe("promisePiped", function(){
	it( "pipes the full buffer through", async function(){
		const istream = new stream.PassThrough();
		istream.end(new Buffer('Test data.'));
		const ostream = new stream.PassThrough();
		await promisePiped( istream, ostream );
	} );
});
