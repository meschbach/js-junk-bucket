const {expect} = require("chai");
const {identity} = require("../fn");

describe("Identity", function(){
	describe("when invoked", function(){
		it("gives the same value", function () {
			expect(identity(1)).to.eq(1);
		});
	})
});