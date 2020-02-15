const {Top} = require("./junk");
const {expect} = require("chai");

describe("Top", function () {
	describe("Given no values", function () {
		it("has an empty set", function () {
			const top = new Top();
			expect(top.bucket).to.deep.eq([]);
		})
	});

	describe("Given a single value", function () {
		it("contains the single value", function () {
			const top = new Top();
			const example = {single:"value"};
			top.write(example);
			expect(top.bucket).to.deep.eq([example]);
		});
	});

	describe("Given more than the top count", function () {
		it("only retains the top values", function () {
			const top = new Top({
				limit: 3
			});
			top.write(0);
			top.write(1);
			top.write(2);
			top.write(3);
			expect(top.bucket).to.deep.eq([3,2,1]);
		});
	});
});
