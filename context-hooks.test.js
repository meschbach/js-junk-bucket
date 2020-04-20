const {expect} = require("chai");
require("chai").use(require("chai-string"));

const {CapturingLogger} = require("./logging");
const {Context} = require("./context");
const {delay} = require("./future");

describe("Context Hooks", function(){
	describe('Given a context', function () {
		let logger, context;
		beforeEach(function () {
			logger = new CapturingLogger();
			context = new Context("test", logger );
		});

		describe("When registering a subcontext hook", function () {
			let givenEvent;
			beforeEach(function () {
				context.on("subcontext", function (event) {
					givenEvent = event;
				});
			});

			describe("And a subcontext has been created", function () {
				beforeEach(function () {
					context.subcontext("jay");
				});

				it("calls the hook", function () {
					expect(givenEvent).to.be.ok;
				});
			})
		})
	});
});
