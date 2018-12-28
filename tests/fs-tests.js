const {expect} = require("chai");

const {exists, makeTempDir, rmRecursively, stat} = require("../fs");

describe('when creating it a directory', function () {
	beforeEach(async function createDirectory() {
		this.dir = await makeTempDir("mkdir-rmdir");
	});

	it("is a directory", async function assertDirectory() {
		const stats = await stat(this.dir);
		expect(stats.isDirectory()).to.be.true;
	});

	describe("when removed recursively", function () {
		beforeEach(async function() {
			await rmRecursively(this.dir);
		});

		it("no longer exists", async function () {
			expect(await exists(this.dir)).to.be.false;
		});
	})
});