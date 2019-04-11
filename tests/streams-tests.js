const {expect} = require("chai");

const stream = require("stream");
const {promisePiped, MemoryReadable} = require("../streams");

describe("promisePiped", function(){
	it( "pipes the full buffer through", async function(){
		const istream = new stream.PassThrough();
		istream.end(Buffer.from('Test data.'));
		const ostream = new stream.PassThrough();
		await promisePiped( istream, ostream );
	} );
});

describe("MemoryReadable", function () {
	describe("On first read request", function () {
		beforeEach(function () {
			this.example = Buffer.from("Memory Readable test example");
			this.stream = new MemoryReadable(this.example);
			this.read = this.stream.read();
		});

		it("provides the buffer", function () {
			expect(this.read).to.deep.eq(this.example);
		});

		it("is still readable", function () {
			expect(this.stream.readable).to.eq(true);
		});

		describe("On second read request", function () {
			beforeEach(function () {
				this.read2 = this.stream.read();
			});

			it("is no longer readable", function () {
				expect(this.read2).to.eq(null);
				expect(this.stream.readable).to.eq(false);
			});
		});
	})
});