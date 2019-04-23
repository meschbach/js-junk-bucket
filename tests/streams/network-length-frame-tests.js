const {expect} = require("chai");
const {LengthPrefixedFrameIngress} = require("../../streams/network-length-frame");
const {defaultNullLogger} = require("../../logging");

const TWENTY_FOUR_KILOBYTES = 24 * 1024;
function randomBuffer( max = TWENTY_FOUR_KILOBYTES){
	const count = (Math.random() * max) + 1;
	return Buffer.alloc(count,count);
}

function framedBuffer( buffer ){
	const header = Buffer.alloc(2);
	header.writeUInt16BE(buffer.length, 0);
	return Buffer.concat([header,buffer]);
}

describe('LengthPrefixedFrameIngress', function () {
	describe("Given an empty stream", function () {
		it("produces no values", function () {
			const sut = new LengthPrefixedFrameIngress({}, defaultNullLogger);

			const chunks = [];
			sut.on('data', function( chunk ){
				chunks.push(chunk);
			});
			expect(chunks).to.deep.eq([]);
		});
	});

	describe("Given a stream with a single frame", function () {
		it("produces a single frame", function () {
			const sut = new LengthPrefixedFrameIngress({}, defaultNullLogger);

			const frames = [];
			sut.on('data', function( frame ){
				frames.push(frame);
			});

			const random = randomBuffer(3);
			sut.write(framedBuffer(random));

			expect(frames).to.deep.eq([random]);
		});
	});

	describe("Given a stream with a multiple frames in a single chunk", function () {
		it("produces all the frames", function () {
			const sut = new LengthPrefixedFrameIngress({}, defaultNullLogger);

			const frames = [];
			sut.on('data', function( frame ){
				frames.push(frame);
			});

			const buffers = [randomBuffer(16), randomBuffer(3), randomBuffer(12)];
			buffers.map((b) => sut.write(framedBuffer(b)));

			expect(frames).to.deep.eq(buffers);
		});
	});

	describe("Given a stream feeding one byte at a time", function () {
		it("produces all the frames", function () {
			const sut = new LengthPrefixedFrameIngress({}, defaultNullLogger);

			const frames = [];
			sut.on('data', function( frame ){
				frames.push(frame);
			});

			const buffer = Buffer.alloc(3);
			buffer.writeUInt16BE(2);
			buffer.writeUInt8(128,2);
			buffer.writeUInt8(127,2);
			sut.write(buffer.slice(0,1));
			sut.write(buffer.slice(1,2));
			sut.write(buffer.slice(2));

			expect(frames).to.deep.eq([buffer.slice(2)]);
		});
	});
});
