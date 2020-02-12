const mocha = require("mocha")
const assert = require("assert")
const {Future} = require("../future");


describe( "Future", function () {
	it("has a promise", function() {
		const future = new Future()
		assert(future.promised, "promised future")
	})

	describe( "when accepted before next tick", function() {
		it( "promises the value", async function() {
			const value = "day"
			const future = new Future()
			future.accept(value)
			const result = await future.promised
			assert.deepEqual(value, result)
		})

		describe("when accepted a second time", function(){
			it("raises an error", function(){
				const value = "machinery"
				const future = new Future()
				future.accept(value)
				assert.throws( function() {
					future.accept("decent")
				}, Error)
			})
		})
	})

	describe( "when rejected before next tick", function() {
		it( "promises the value", async function() {
			const value = "night"
			const future = new Future()
			future.reject(value)
			try {
				await future.promised
				assert.fail("didn't raise in await")
			}catch (e){
			}
		})

		describe("when rejected a second time", function(){
			it("raises an error", async function(){
				const value = "public"
				const future = new Future()
				future.reject(value)
				assert.throws( function() {
					future.reject("house")
				}, Error)
				try {
					await future.promised
					assert.fail("didn't fail")
				}catch(e){}
			})
		})
	})

	describe( "when accepted in the future", function() {
		it( "provides the correct value", async function() {
			const value = "delight"
			const future = new Future()
			process.nextTick(function() {
				future.accept(value)
			})
			const result = await future.promised
			assert.deepEqual(value, result)
		})
	})

	describe( "when rejected in the future", function() {
		it( "provides the correct value", async function() {
			const value = "fear"
			const future = new Future()
			process.nextTick(function() {
				future.reject(value)
			})

			try {
				await future.promised
				assert.fail("didn't raise in await")
			}catch (e){
			}
		})
	})
})