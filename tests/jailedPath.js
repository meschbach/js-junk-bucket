
const path = require("path");
const {expect} = require("chai");
const {jailedPath} = require("../vfs");

/**********************************************************
 *
 **********************************************************/
function verifyJailedPath( root, relative ){
	beforeEach(function () {
		this.resolved = jailedPath(root,relative);
	});
}

describe("jailedPath", function () {
	describe("Given a relative path", function () {
		verifyJailedPath("/tmp/jail", "some-path");

		it("resolves to a path under the root", function () { expect(this.resolved).to.eq("/tmp/jail/some-path"); });
		it("is absolute", function(){ expect(path.isAbsolute(this.resolved)).to.eq(true); });
	});

	describe("Given an aboslute path", function () {
		verifyJailedPath("/tmp/jail", "/empire");

		it("resolves to a path under the root", function () { expect(this.resolved).to.eq("/tmp/jail/empire"); });
		it("is absolute", function(){ expect(path.isAbsolute(this.resolved)).to.eq(true); });
	});

	describe("Given multiple double dot paths", function () {
		verifyJailedPath("/tmp/jail", "../../escape");

		it("resolves to a path under the root", function () { expect(this.resolved).to.eq("/tmp/jail/escape"); });
		it("is absolute", function(){ expect(path.isAbsolute(this.resolved)).to.eq(true); });
	});

	describe("Given double doth paths", function () {
		verifyJailedPath("/tmp/jail", "terrible/../../attack/example/../here");

		it("resolves to a path under the root", function () { expect(this.resolved).to.eq("/tmp/jail/attack/here"); });
		it("is absolute", function(){ expect(path.isAbsolute(this.resolved)).to.eq(true); });
	});

	describe("Given an internal slash", function () {
		verifyJailedPath("/tmp/jail", "fallback//to-root");

		it("resolves to a path under the root", function () { expect(this.resolved).to.eq("/tmp/jail/fallback/to-root"); });
		it("is absolute", function(){ expect(path.isAbsolute(this.resolved)).to.eq(true); });
	});
});
