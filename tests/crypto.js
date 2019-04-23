const {expect} = require("chai");
const {sha256_from_string} = require("../crypto");

describe("sha256_from_string", function(){
	it("generates a SHA256 from a string", function(){
		const sha256 = sha256_from_string("test");
		expect(sha256).to.eq("9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08");
	});
});
