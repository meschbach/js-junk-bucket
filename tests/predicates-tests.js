const mocha = require("mocha");
const assert = require("assert");
const predicates = require("../predicates");

describe("eq", function () {
	it("makes a function which asserts equality of booleans", function () {
		const op = predicates.eq(true);
		assert(op(true));
		assert(! op(false));
	});

	it("makes a function which asserts equality of strings", function () {
		const op = predicates.eq("send it home");
		assert(op("send it home"));
		assert(! op("send it to you"));
	});
});
