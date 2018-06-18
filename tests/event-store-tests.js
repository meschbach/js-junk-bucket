const {EventStore, MemoryStore} = require("../event-store");
const {promiseEvent} = require("../future");
const assert = require('assert');

describe("EventStore", function () {
	describe("when an event is stored", function () {
		it("the event is retrievable", async function () {
			const event = { event: true };
			const store = new EventStore( new MemoryStore() );
			await store.store( event );
			const events = await store.all();
			assert.deepEqual( events, [ event ]);
		});

		it("streams the event to interested parties", async function() {
			const event = {
				when: Date.now()
			};
			const store = new EventStore( new MemoryStore() );
			const onEvent = promiseEvent(store, "stored");
			await store.store( event );
			const stored = await onEvent;
			assert.equal( stored.event, event );
		});
	});

	describe("materialized views", function () {
		it( "will stream each event", async function () {
			let filterSaw, viewSaw;
			const store = new EventStore( new MemoryStore() );
			store.materialized( function ( event ) {
				filterSaw = event;
				return true;
			}, function ( event ) {
				viewSaw = event
			});

			const envelope = await store.store({
				when: Date.now()
			});
			assert.equal(filterSaw, envelope);
			assert.equal(viewSaw, envelope);
		});

		it( "will catch up from the start of the stream and keep up", async function () {
			function makeEvent() { return { when: Date.now() }; }
			const filterSaw = [], viewSaw = [];
			const store = new EventStore( new MemoryStore() );
			const firstEnvelope = await store.store( makeEvent() );
			const secondEnvelope = await store.store( makeEvent() );

			await store.materialized( function ( event ) {
				filterSaw.push(event);
				return true;
			}, function ( event ) {
				viewSaw.push(event);
			});

			const envelope = await store.store( makeEvent() );
			assert.deepEqual(filterSaw, [firstEnvelope, secondEnvelope, envelope]);
			assert.deepEqual(viewSaw, [firstEnvelope, secondEnvelope, envelope]);
		});
	});
});
