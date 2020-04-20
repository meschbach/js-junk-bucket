const {expect} = require("chai");
require("chai").use(require("chai-string"));

const {CapturingLogger} = require("./logging");
const {Context} = require("./context");
const {delay} = require("./future");

describe("Tracks context and cleanup", function(){
	describe('Given a context', function () {
		beforeEach(function () {
			this.logger = new CapturingLogger();
			this.context = new Context("test", this.logger );
		});

		describe("and a registered cleanup item which executes immediately", function(){
			beforeEach(function () {
				this.context.onCleanup(() =>{
					this.invokedCleanup = true;
				});
			});

			describe("when cleanup is requested", function () {
				beforeEach(function () {
					this.context.cleanup();
				});

				it("invokes the given callback", function () {
					expect(this.invokedCleanup).to.be.true;
				});

				it("generates no errors", function () {
					expect(this.logger.messages.error).to.be.empty;
				})
			})
		});

		describe("and a registered cleanup item which defers completion", function(){
			beforeEach(function () {
				this.invokedCleanup = false;
				this.context.onCleanup(async () =>{
					await delay(5);
					this.invokedCleanup = true;
				});
			});

			describe("when cleanup is requested", function () {
				beforeEach( async function () {
					await this.context.cleanup();
				});

				it("invokes the given callback", function () {
					expect(this.invokedCleanup).to.be.true;
				});

				it("generates no errors", function () {
					expect(this.logger.messages.error).to.be.empty;
				})
			})
		});

		describe("and a registered cleanup item which will throw", function(){
			beforeEach(function () {
				this.context.onCleanup(() =>{
					throw new Error("test");
				});
			});

			describe("when cleanup is requested", function () {
				beforeEach(function () {
					this.context.cleanup();
				});

				it("logs the exception", function () {
					expect(this.logger.messages.error).to.not.be.empty;
				})
			})
		});

		describe("When creating a subcontext", function(){
			const subcontextName = "clairinet";
			beforeEach(function(){
				this.sub = this.context.subcontext( subcontextName );
			});

			it( "has the name as a suffix", function(){
				expect(this.sub.name).to.endWith(subcontextName);
			});

			describe("And registering a cleanup function", function(){
				beforeEach(function () {
					this.invokedCleanup = false;
					this.sub.onCleanup(async () =>{
						await delay(5);
						this.invokedCleanup = true;
					});
				});

				describe("And cleanup is called on the parent", function(){
					beforeEach(async function () {
						await this.context.cleanup();
					});

					it("invokes cleanup on the child", function(){
						expect(this.invokedCleanup).to.be.true;
					});

					it("generates no errors", function () {
						expect(this.logger.messages.error).to.be.empty;
					})
				});
			});
		});
	});
});
