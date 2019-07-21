/**
 * Tests query functionality of an events system
 */
const {expect} = require("chai");
const {MemoryEventStore} = require("./v1");

const assert = require("assert");
const {property, arg2} = require("../fn");

async function renderKeyValueState( eventStore, keyMapper, valueMapper){
	const state = {};
	async function keyValueReducer(momento, event){
		const key = keyMapper(event, momento);
		const value = valueMapper(event, momento);
		state[key] = value;
	}
	await eventStore.replay(keyValueReducer);
	return state;
}

class UniqueKeyValueView {
	constructor(eventStore, keyMapper, valueMapper) {
		assert(eventStore);
		assert(keyMapper);
		assert(valueMapper);
		this.eventStore = eventStore;
		this.keyMapper = keyMapper;
		this.valueMapper = valueMapper;
	}

	async count(){
		const state = await renderKeyValueState(this.eventStore, this.keyMapper, this.valueMapper);
		return Object.keys(state).length;
	}
}

describe("events.UniqueKeyValueView", function(){
	describe("given an empty event set", function(){
		it("has no matching events", async function(){
			const eventStore = new MemoryEventStore();
			const view = new UniqueKeyValueView(eventStore, arg2, arg2);
			expect(await view.count()).to.eq(0);
		});
	});

	describe("given a populated event set", function () {
		it("registers the proper event counts", async function () {
			const eventStore = new MemoryEventStore();
			eventStore.publish({key: "a", value: 0});
			eventStore.publish({key: "b", value: 1});
			eventStore.publish({key: "c", value: 2});

			const view = new UniqueKeyValueView(eventStore, property("key"), property("value"));
			expect(await view.count()).to.eq(3);
		});
	});
});
