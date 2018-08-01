const assert = require("assert");
const {expect} = require("chai");

const net = require("net");

const express = require("express");

const {addressOnListen} = require("../sockets");

describe("addressOnListen", function(){
	describe("with net server socket", function(){
		describe("with no bind address", function(){
			beforeEach( async function(){
				const socket = new net.Server();
				this.result = addressOnListen(socket, 0);
				this.address = await this.result.address;
			});

			afterEach( function(){
				this.result.stop();
			});

			it("has host 'localhost'", function(){
				expect(this.address.host).to.eq("localhost");
			});

			it("has a port", function(){
				assert(this.address.port);
			});
			it("has a family ipv6", function(){
				expect(this.address.family).to.eq("IPv6");
			})
		});
	});

	describe("with express", function(){
		describe("with no bind address", function(){
			beforeEach( async function(){
				const app = express();
				this.result = addressOnListen(app, 0);
				this.address = await this.result.address;
			});

			afterEach( function(){
				this.result.stop();
			});

			it("has host 'localhost'", function(){
				expect(this.address.host).to.eq("localhost");
			});

			it("has a port", function(){
				assert(this.address.port);
			});
			it("has a family ipv6", function(){
				expect(this.address.family).to.eq("IPv6");
			})
		});

		describe("with a specific port", function(){
			beforeEach( async function(){
				const app = express();
				this.port = 54321;
				this.result = addressOnListen(app, this.port);
				this.address = await this.result.address;
			});

			afterEach( function(){
				this.result.stop();
			});

			it("has host 'localhost'", function(){
				expect(this.address.host).to.eq("localhost");
			});

			it("has a port", function(){
				expect(this.address.port).to.eq(this.port);
			});

			it("has a family ipv6", function(){
				expect(this.address.family).to.eq("IPv6");
			})
		});
	});
});