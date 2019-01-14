const {expect} = require("chai");
const {Context} = require("../context");
const {delay} = require("../future");

describe("Tracks context and cleanup", function(){
	describe('Given a context', function () {
		beforeEach(function () {
			this.loggedErrors = [];
			const captureLogger = {
				error: (...args) => {
					this.loggedErrors.push(args);
				}
			};
			this.context = new Context("test", captureLogger);
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
					expect(this.loggedErrors).to.be.empty;
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
					expect(this.loggedErrors).to.be.empty;
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
					expect(this.loggedErrors).to.not.be.empty;
				})
			})
		});
	});
});