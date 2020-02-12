const {ArraySource} = require("./array-adapters");
const {expect} = require("chai");
const {promiseEvent} = require("../future");

describe("ArraySource", function () {
	describe("Given an empty array", function () {
		it("immediately ends", function () {
			const readable = new ArraySource([]);
			expect(readable.read()).to.eq(null)
		});
	});

	describe("Given an array", function () {
		it("provides all elements of the array", async function () {
			const givenElements = ["Test",1,{object:true}];
			const found = [];

			const readable = new ArraySource(givenElements.concat([]));
			readable.on("data", (d) => {
				found.push(d)
			});
			await promiseEvent(readable,"end");
			expect(found).to.deep.eq(givenElements);
		});
	});
});
