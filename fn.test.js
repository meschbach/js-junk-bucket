const {expect} = require("chai");
const {identity, arg2, highestFirstComparator} = require("./fn");

describe("Identity", function(){
	describe("when invoked", function(){
		it("gives the same value", function () {
			expect(identity(1)).to.eq(1);
		});
	})
});

describe("arg2", function () {
	describe("when given two values", function () {
		it("returns the second value", function () {
			expect(arg2(1,2)).to.eq(2);
		});
	});
});

const {filterEnvelope} = require("./fn");
describe("filterEnvelope", function (){
	describe("When given a low value", function () {
		it("is falsy", function () {
			expect(filterEnvelope(10,20, identity)(1)).to.be.false;
		});
	});

	describe("When given a high value", function () {
		it("is falsy", function () {
			expect(filterEnvelope(10,20, identity)(21)).to.be.false;
		});
	});

	describe("When given a value within the envelope", function () {
		it("is truthy", function () {
			expect(filterEnvelope(10,20, identity)(15)).to.be.true;
		});
	});

	describe("When given a value on the low side of the envelope", function () {
		it("is truthy", function () {
			expect(filterEnvelope(10,20, identity)(10)).to.be.true;
		});
	});

	describe("When given a value on the high side of the envelope", function () {
		it("is truthy", function () {
			expect(filterEnvelope(10,20, identity)(20)).to.be.true;
		});
	});
});

const {y} = require("./fn");
describe("y combinator", function () {
	describe("when given no functions", function () {
		it("returns the input", function () {
			expect(y()(42)).to.eq(42);
		})
	});

	describe("when given a set of functions", function () {
		it("calls each one", function () {
			let called = 0;
			const call = (c) => {
				called++;
				return called + c;
			};
			expect(y(call,call,call)(1)).to.eq(7);
			expect(called).to.eq(3);
		})
	});
});

describe("highestFirstComparator", function () {
	describe("Given integers", function () {
		it("is zero for equal elements", function () {
			const comparator = highestFirstComparator();
			expect(comparator(42,42)).to.eq(0);
		});
		it("is greater than zero for RHS being higher", function () {
			const comparator = highestFirstComparator();
			expect(comparator(64,96)).to.be.above(0);
		});
		it("is less than zero for RHS being lower", function () {
			const comparator = highestFirstComparator();
			expect(comparator(3,2)).to.be.below(0);
		});

		describe("When fed through Array.sort", function () {
			it("yields inverse natural values", function () {
				const comparator = highestFirstComparator();
				const input = [1,96,4,32,42];
				input.sort(comparator);
				expect(input).to.deep.eq([96,42,32,4,1]);
			});
		});
	});
});
