const {expect} = require("chai");
const {first, last} = require("../arrays");

describe( "first", function(){
	beforeEach(function(){
		this.example = ["a","b","c","d"];
		this.original = [].concat(this.example);
		this.result = first(this.example, 3);
	});

	it( "gives the first requested", function(){
		expect(this.result).to.deep.eq(["a","b","c"]);
	} );

	it( "leaves the original array in intact", function () {
		expect(this.example).to.deep.eq(this.original);
	} );
} );


describe( "last", function(){
	beforeEach(function(){
		this.example = ["a","b","c","d","e","f","g","h"];
		this.original = [].concat(this.example);
		this.result = last(this.example, 3);
	});

	it( "gives the first requested", function(){
		expect(this.result).to.deep.eq(["f","g","h"]);
	} );

	it( "leaves the original array in intact", function () {
		expect(this.example).to.deep.eq(this.original);
	} );
} );