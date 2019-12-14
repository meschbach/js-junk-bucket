const {expect} = require("chai");

const {promiseEvent} = require("./future");
const {JSONPipe} = require("./json-pipe");

describe("JSONPipe",function () {
	describe("When asked to send a message", function(){
		it("dispatches a simple message on a future tick", async function () {
			const exampleMessage = "will you dance with me";

			const pipe = new JSONPipe();
			const promise = promiseEvent(pipe,"message");
			pipe.send(exampleMessage);
			const value = await promise;
			expect(value).to.eq(exampleMessage);
		});

		it("dispatches a complex object on future tick", async function () {
			const exampleMessage = {"complex":"number"};

			const pipe = new JSONPipe();
			const promise = promiseEvent(pipe,"message");
			pipe.send(exampleMessage);
			const value = await promise;
			expect(value).to.deep.eq(exampleMessage);
		});
	});
});