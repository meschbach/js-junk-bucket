const {ArrayCapture} = require("./array-adapters");
const {expect} = require("chai");
const {promiseEvent} = require("../future");

describe("ArrayCapture", function () {
	describe("Given an empty stream", function () {
		it("contains no elements", async function () {
			const capture = new ArrayCapture();
			expect(capture.elements).to.deep.eq([]);
		});
	});

	describe("Given a set of values", function () {
		it("contains no elements", async function () {
			const example = ["String test", 42, {object:"yes", deep: {nested: "totally"}}];

			const capture = new ArrayCapture();
			for( let e of example ){
				capture.write(e);
			}
			expect(capture.elements).to.deep.eq(example);
		});
	});
});
