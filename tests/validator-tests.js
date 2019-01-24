const mocha = require("mocha")
const assert = require("assert")

const {Validator} = require("../validation")

describe( "Validator", function() {
	describe("when not used", function() {
		beforeEach(function(){
			this.validator = new Validator();
		});

		it("is valid", function(){
			assert( this.validator.valid );
		});

		it("has no warnings", function () {
			assert(! this.validator.warnings);
		});
		it("has a response with no keys", function(){
			assert.equal( Object.keys(this.validator.result).length, 0, "has response keys");
		});
	});

	describe("when given an error", function(){
		beforeEach(function(){
			this.validator = new Validator();
			this.message = "charge";
			this.validator.error("test", this.message );
		});

		it("is valid", function(){
			assert(! this.validator.valid);
		});

		it("does not have a 'warnings' response key", function(){
			assert(! this.validator.result.warnings);
		});

		it("has an 'errors' response key with the 'test' subkey", function(){
			assert( this.validator.result.errors["test"].length, 1 );
			assert( this.validator.result.errors["test"][0], this.message );
		});
	});


	describe("when given a warning", function(){
		beforeEach(function(){
			this.validator = new Validator();
			this.message = "buyer";
			this.key = "example";
			this.validator.warn("example", "buyer");
		});

		it("is valid", function () {
			assert(this.validator.valid);
		});

		it("has no errors", function(){
			assert(!this.validator.errors);
		});

		it("has an 'warnings' response key with the 'example' subkey", function () {
			assert( this.validator.result.warnings[this.key].length, 1 );
			assert( this.validator.result.warnings[this.key][0], this.message );
		});

		it("does not have a 'errors' response key", function () {
			assert(! this.validator.result.errors);
		});
	})
});
