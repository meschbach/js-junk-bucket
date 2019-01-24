const {expect} = require("chai");
const {validate} = require("../validation");

function it_is_invalid(){
	it("is invalid", function(){
		expect(this.result.valid).to.be.false;
	})
}

function it_is_valid(){
	it("is valid", function(){
		expect(this.result.valid).to.be.true;
	})
}

function then_internalized_is_undefined(){
	it("provides an invalid internalized value", function(){
		expect(this.internalized).to.be.undefined;
	});
}

function then_internalized_as(value){
	it("provides an invalid internalized value", function(){
		expect(this.internalized).to.deep.eq(value);
	});
}

function then_has_error_with_key(key, errors){
	it("complains about missing value", function () {
		expect( this.result.result.errors[key]).to.deep.eq( errors );
	});
}

function then_has_no_errors(){
	it("has no errors", function () {
		expect( this.result.result.errors ).to.be.undefined;
	});
}

describe("validate", function(){
	describe("Given a validation request with an undefined object", function(){
		beforeEach(function () {
			this.graph = validate(undefined);
		});

		describe("when requesting to validate", function(){
			beforeEach(function(){
				this.result = this.graph.done();
			});

			it_is_invalid();
		})
	});

	describe("Given a validation request with an empty object", function(){
		beforeEach(function () {
			this.graph = validate({});
		});

		describe("when requesting to validate", function(){
			beforeEach(function(){
				this.result = this.graph.done();
			});

			it_is_valid();
		});

		describe("When requiring a string", function(){
			beforeEach(function () {
				this.internalized = this.graph.string("example-string");
				this.result = this.graph.done();
			});

			it_is_invalid();
			then_internalized_is_undefined();
			then_has_error_with_key("example-string",["string"]);
		});

		describe("When requiring a number", function(){
			beforeEach(function () {
				this.internalized = this.graph.numeric("test");
				this.result = this.graph.done();
			});

			it_is_invalid();
			then_internalized_is_undefined();
			then_has_error_with_key("test",["numeric"]);
		});
	});

	describe("Given a validation request with a reasonable test object", function(){
		beforeEach(function () {
			this.graph = validate({
				int: '132',
				cstr: "next big score"
			});
		});

		describe("when requesting to validate", function(){
			beforeEach(function(){
				this.result = this.graph.done();
			});

			it_is_valid();
		});

		describe("When requiring an existing string", function(){
			beforeEach(function () {
				this.internalized = this.graph.string("cstr");
				this.result = this.graph.done();
			});

			it_is_valid();
			then_has_no_errors();
			then_internalized_as("next big score");
		});

		describe("When requiring a number", function(){
			beforeEach(function () {
				this.internalized = this.graph.numeric("int");
				this.result = this.graph.done();
			});

			it_is_valid();
			then_has_no_errors();
			then_internalized_as(132);
		});
	});
});
