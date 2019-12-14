const {expect} = require("chai");

const {RPCClient, RPCService} = require("./rpc");
const {JSONPipe} = require("./json-pipe");

describe("Given an RPC mechanism", function () {
	describe("When a registered call is invoked", function () {
		it("calls the target", async function () {
			const clientToService = new JSONPipe();
			const serviceToClient = new JSONPipe();

			const client = new RPCClient(serviceToClient, clientToService);
			const service = new RPCService(clientToService, serviceToClient);
			let called = false;
			service.register("hello-world", () => called = true);
			await client.call("hello-world");
			expect(called).to.eq(true);
		});

		it("returns the target value", async function(){
			const clientToService = new JSONPipe();
			const serviceToClient = new JSONPipe();

			const client = new RPCClient(serviceToClient, clientToService);
			const service = new RPCService(clientToService, serviceToClient);
			const greeting = "yo!";
			service.register("hello-world", () => greeting);
			const result = await client.call("hello-world");
			expect(result).to.eq(greeting);
		});
	});

	describe("When an unregistered call is invoked", function(){
		it("raises an error", async function () {
			const clientToService = new JSONPipe();
			const serviceToClient = new JSONPipe();

			const client = new RPCClient(serviceToClient, clientToService);
			const service = new RPCService(clientToService, serviceToClient);
			service.register("hello-world", () => {throw new Error("no")});
			let error;
			try {
				await client.call("hello-world")
			}catch(e){
				error = e;
			}
			expect(error.name).to.eq("Error");
		});
	});
});