const mocha = require("mocha")
const assert = require("assert")

const Future = require("../future")
const {LogicalTimer, WatchDog} = require("../timers")

class BufferingConsumer {
	constructor( ) {
		this.messages = []
	}
	consume( message ){
		this.messages.push(message);
		return true;
	}

	end() {

	}
}

class Sequence {
	constructor() {
		const when = new Future()
		when.accept(true);
		this.last_op = when.promised;
	}

	next( perform ){
		const operation = this.last_op.then(( input ) => {
			return perform( input )
		});
		this.last_op = operation;
		return operation;
	}

	within_otherwise( timeframe, perform, fail, clock ) {
		let canceled = false;
		let waiting = true;
		const token = clock.notifyIn(timeframe, () =>{
			if( waiting ) {
				canceled = true;
				fail()
			}
		})
		this.next( (input) => {
			if( canceled ){ return input; }
			waiting = false;
			clock.cancel(token)
			return perform( input )
		});
	}
}

class DelayedConsumer {
	/**
	 *
	 * @param completeAfter Appetite for messages to sit in the buffer
	 * @param clock timer to utilize for alarms (defaults to Node clock)
	 */
	constructor( completeAfter, clock) {
		this.messages = [];
		this.completeAfter = completeAfter;
		this.clock = clock;
		const when = new Future()
		when.accept(true);
		this.last_op = when.promised;
		this.ended = false;
	}

	_next_operation( perform ) {
		const operation = this.last_op.then(() => {
			return this.clock.notifyIn(this.completeAfter, perform);
		});
		this.last_op = operation;
		return operation;
	}

	consume( message ){
		return this._next_operation( () => {
			this.messages.push( message )
		});
	}

	end() {
		return this._next_operation( () => {
			this.ended = true;
		})
	}
}

class BufferingStorage {
	constructor(){
		this.waiting = []
	}

	store(message){
		this.waiting.push(message)
	}
}

class Spool {
	constructor( consumerFactory, consumerExpiry = 5, storage, clock ) {
		assert(clock, "clock");
		assert(storage, "storage");
		assert(consumerFactory, "consumer factory");
		this.consumerFactory = consumerFactory;
		this.consumerExpiry = consumerExpiry;
		this.clock = clock;
		this.storage = storage;
	}

	publish( message ) {
		/*
		 * Create the consumer
		 */
		//TODO: Might be better to expire in a SpoolConsumer
		if( !this.consumer ){
			this.consumer = this.consumerFactory();
			this.consumerWatch = new WatchDog( this.consumerExpiry, () => {
				this.consumer.end();
				this.consumer = null;
				this.consumerWatch = null;
			}, this.clock);
		} else {
			this.consumerWatch.reset();
		}
		/*
		 * Send the message to the consumer
		 */
		this.consumer.consume( message )
	}
}

describe( "Spool", function() {
	beforeEach( function() {
		this.consumerExpiry = 10;
		this.logicalClock = new LogicalTimer();
		this.lastConsumer = null;
		this.consumerFactoryCount = 0;
		this.consumerFactory = () => {
			this.consumerFactoryCount++;
			this.lastConsumer = new BufferingConsumer();
			return this.lastConsumer;
		}
		this.spool = new Spool( this.consumerFactory, this.consumerExpiry, new BufferingStorage(), this.logicalClock );
	});

	function it_has_consumer_count(count, message) {
		it(message, function () {
			assert.equal(this.consumerFactoryCount, count);
		})
	}

	it_has_consumer_count(0, "doesn't immediately create a consumer")

	describe("when first message is published", function() {
		beforeEach( function() {
			this.message = "damage";
			this.spool.publish( this.message );
		});

		it_has_consumer_count(1, "creates a new consumer")
		it("sends the consumer the message", function() { assert.deepEqual(this.lastConsumer.messages, [this.message]); })

		describe("before the consumer timeout", function(){
			describe("when sent a second message", function(){
				beforeEach(function(){
					this.second = "make it on our own"
					this.spool.publish(this.second);
				})

				it_has_consumer_count(1, "reuses the old consumer")
				it("sends the consumer a second message", function(){
					assert.deepEqual(this.lastConsumer.messages, [this.message, this.second]);
				})
			})
		})

		describe('after the consumer timeout', function () {
			beforeEach(function(){
				this.logicalClock.advance( this.consumerExpiry );
			});

			describe('when sending a second message', function () {
				beforeEach(function () {
					this.secondMessage = "Wisemen say life is suffering"
					this.spool.publish(this.secondMessage)
				});

				it_has_consumer_count(2, "creates a new consumer")

				it("sends the message to the consumer", function(){
					assert.deepEqual(this.lastConsumer.messages, [this.secondMessage]);
				})
			});
		});
	});

	xdescribe('when a message is published while another is sending', function () {
		beforeEach( function() {
			this.consumerExpiry = 10;
			this.transmissionWait = 5;

			this.logicalClock = new LogicalTimer();
			this.lastConsumer = null;
			this.consumerFactoryCount = 0;
			this.consumerFactory = () => {
				this.consumerFactoryCount++;
				this.lastConsumer = new DelayedConsumer();
				return this.lastConsumer;
			}
			this.storage = new BufferingStorage()
			this.spool = new Spool( this.consumerFactory, this.consumerExpiry, this.storage, this.logicalClock );

			this.firstMessage = Symbol('first')
			this.secondMessage = Symbol('second')
			this.spool.publish(this.firstMessage)
			this.spool.publish(this.secondMessage)
		});

		describe('and the storage tolerance elapses', function () {
			beforeEach(function () {
				this.logicalClock.advance(this.transmissionWait)
			})

			it("sends the message to storage", function () {
				assert.deepEqual(this.storage.waiting, [this.secondMessage])
			})

			describe('when the message sends', function () {
				it('sends the message from storage')
			});
		});

		describe('and the send message completes', function () {
			it('sends the message to the consumer')
		});
	});
});
