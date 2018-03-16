const mocha = require("mocha")
const assert = require("assert")

const {Sequence} = require('../sequence')
const Future = require('../future')

describe("Sequence", function () {
	it("initial value is passed to first in sequence", async function(){
		const example = Symbol('doom')
		const subject = new Sequence( example );
		return await subject.next( (value) => {
			assert.equal(example, value)
		})
	});

	describe("when the first operation is incomplete", function () {
		describe("when a second is queued", function () {
			it("a second is not executed immediately", async function () {
				const gate = new Future()
				const subject = new Sequence( );
				subject.next( () => gate.promised );
				var executed = false;
				subject.next( () => {
					executed = true
				});
				assert(!executed, "executed early")
			})

			describe("after the first operation completes", function () {
				it("gives the result to the second", async function () {
					const gate = new Future()
					const subject = new Sequence( );
					subject.next( () => gate.promised );
					const example = Symbol("should be returned")
					var promise = subject.next( () => {
						return example
					});
					gate.accept(true)
					const result = await promise
					assert.equal(example, result)
				})
			})
		})
	})
});
