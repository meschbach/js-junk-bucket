const {expect} = require("chai");
const {InMemoryVFS} = require("../vfs");
const {MemoryWritable, promisePiped} = require("../streams");
const {promiseEvent} = require("../future");

async function promiseFinished( from, writeChunk ){
	const done = promiseEvent( from, "finish");
	const result = await writeChunk();
	await done;
	return result;
}

function abstractVFSBehavior( VFS, name ) {
	describe(name + " acts like a VFS", function () {
		describe("Given a file which does not exist", function(){
			it("when queried it does not exist", async function(){
				const sut = new VFS();
				expect(await sut.exists("nonexistent-file")).to.eq(false);
			});
		});

		describe("When creating a file as bytes", function(){
			beforeEach(async function(){
				this.sut = new VFS();
				this.fileName = "devision";
				this.fileContents = "where do we go from here, stop and shed a tear";
				await this.sut.putBytes(this.fileName, this.fileContents, this.fileContents.encoding);
			});

			abstractReadBackBehaviors();
		});

		describe("When creating a file as a stream", function(){
			beforeEach(async function(){
				this.sut = new VFS();
				this.fileName = "mono-inc";
				this.fileContents = "Is there somebody out here?  Is somebody listening?";
				const sink = await this.sut.createWritableStream(this.fileName);
				await promiseFinished(sink, async () => {
					sink.end(this.fileContents);
				});
			});

			abstractReadBackBehaviors();
		});
	});
}

abstractVFSBehavior(InMemoryVFS, "InMemoryVFS");

function abstractReadBackBehaviors(){
	it("is readable as a stream", async function(){
		const istream = await this.sut.createReadableStream(this.fileName);
		//TODO: The following should really be abstracted into a "promise to read all bytes" thing
		const sink = new MemoryWritable();
		await promisePiped(istream,sink);
		expect(sink.bytes.toString("utf-8")).to.deep.eq(this.fileContents);
	});

	it("is readable as bytes", async function(){
		const bytes = await this.sut.asBytes(this.fileName);
		expect(bytes.toString("utf-8")).to.deep.eq(this.fileContents);
	});

	it("can not mutate returned byte buffer", async function(){
		const bytes1 = await this.sut.asBytes(this.fileName);
		bytes1.writeUInt32LE(42);
		const bytes2 = await this.sut.asBytes(this.fileName);
		expect(bytes2.toString("utf-8")).to.deep.eq(this.fileContents);
	});

	it("exists", async function(){
		expect( await this.sut.exists(this.fileName)).to.eq(true);
	});

	describe("And is unlinked", function(){
		beforeEach(async function(){
			await this.sut.unlink(this.fileName);
		});

		it("does not exist", async function(){
			expect(await this.sut.exists(this.fileName)).to.eq(false);
		});
	});
}
