const {expect} = require("chai");
require("chai").use(require("chai-string"));

const {CapturingLogger} = require("./logging");
const {Context} = require("./context");
const {delay} = require("./future");

describe("Tracks context and cleanup", function(){
	describe('Given a context', function () {
		let invokedCleanup, invokedCleanupCount;
		let logger, context;
		beforeEach(function () {
			logger = new CapturingLogger();
			context = new Context("test", logger );
			invokedCleanup = false;
			invokedCleanupCount = 0;
		});

		describe("and a registered cleanup item which executes immediately", function(){
			beforeEach(function () {
				context.onCleanup(() => {
					invokedCleanup = true;
					invokedCleanupCount++;
				});
			});

			it( "has not been cleaned up", function () {
				expect(invokedCleanup).to.be.false;
			});

			describe("when cleanup is requested", function () {
				beforeEach( async function () {
					await context.cleanup();
				});

				it("invokes the given callback", function () {
					expect(invokedCleanup).to.be.true;
				});

				it("generates no errors", function () {
					expect(this.logger.messages.error).to.be.empty;
				})
			})
		});

		describe("and a registered cleanup item which defers completion", function(){
			beforeEach(function () {
				this.invokedCleanup = false;
				context.onCleanup(async () =>{
					await delay(5);
					this.invokedCleanup = true;
				});
			});

			describe("when cleanup is requested", function () {
				beforeEach( async function () {
					await context.cleanup();
				});

				it("invokes the given callback", function () {
					expect(this.invokedCleanup).to.be.true;
				});

				it("generates no errors", function () {
					expect(logger.messages.error).to.be.empty;
				})
			})
		});

		describe("and a registered cleanup item which will throw", function(){
			beforeEach(function () {
				context.onCleanup(() =>{
					throw new Error("test");
				});
			});

			describe("when cleanup is requested", function () {
				beforeEach(function () {
					context.cleanup();
				});

				it("logs the exception", function () {
					expect(logger.messages.error).to.not.be.empty;
				})
			})
		});

		describe("When creating a subcontext", function(){
			const subcontextName = "clairinet";
			let sub;
			beforeEach(function(){
				sub = context.subcontext( subcontextName );
			});

			it( "has the name as a suffix", function(){
				expect(sub.name).to.endWith(subcontextName);
			});

			describe("And registering a cleanup function", function(){
				beforeEach(function () {
					invokedCleanup = false;
					sub.onCleanup(async () =>{
						await delay(5);
						this.invokedCleanup = true;
					});
				});

				describe("And cleanup is called on the parent", function(){
					beforeEach(async function () {
						await context.cleanup();
					});

					it("invokes cleanup on the child", function(){
						expect(this.invokedCleanup).to.be.true;
					});

					it("generates no errors", function () {
						expect(logger.messages.error).to.be.empty;
					})
				});
			});
		});
	});
});
