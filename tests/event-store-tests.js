const assert = require('assert');
const {expect} = require('chai');

const {EventStore, MemoryStore} = require("../event-store");
const {promiseEvent} = require("../future");

describe("EventStore", function () {
	beforeEach(function () {
		this.store = new EventStore( new MemoryStore() );
	});

	describe("when an event is stored", function () {
		beforeEach( async function () {
			this.when = Date.now();

			this.event = { event: true, when:  this.when };
			this.onEvent = promiseEvent(this.store, "stored");

			await this.store.store( this.event );
		});

		it("the event is retrievable", async function () {
			expect(await this.store.all()).to.deep.eq([this.event]);
		});

		it("streams the event to interested parties", async function() {
			const stored = await this.onEvent;
			expect( stored.event ).to.deep.eq( this.event );
		});
	});

	describe("materialized views", function () {
		it( "will stream each event", async function () {
			let filterSaw, viewSaw;
			this.store.materialized( function ( event ) {
				filterSaw = event;
				return true;
			}, function ( event ) {
				viewSaw = event
			});

			const envelope = await this.store.store({
				when: Date.now()
			});
			assert.equal(filterSaw, envelope);
			assert.equal(viewSaw, envelope);
		});

		it( "will catch up from the start of the stream and keep up", async function () {
			function makeEvent() { return { when: Date.now() }; }
			const filterSaw = [], viewSaw = [];
			const firstEnvelope = await this.store.store( makeEvent() );
			const secondEnvelope = await this.store.store( makeEvent() );

			await this.store.materialized( function ( event ) {
				filterSaw.push(event);
				return true;
			}, function ( event ) {
				viewSaw.push(event);
			});

			const envelope = await this.store.store( makeEvent() );
			assert.deepEqual(filterSaw, [firstEnvelope, secondEnvelope, envelope]);
			assert.deepEqual(viewSaw, [firstEnvelope, secondEnvelope, envelope]);
		});
	});
});
