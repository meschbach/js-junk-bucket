const mocha = require("mocha")
const assert = require("assert")

const Future = require("../future")
const {Sequence} = require('../sequence')
const {LogicalTimer, WatchDog, defaultNodeTimer} = require("../timers")

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

class DelayedConsumer {
	/**
	 *
	 * @param completeAfter Appetite for messages to sit in the buffer
	 * @param clock timer to utilize for alarms (defaults to Node clock)
	 */
	constructor( completeAfter, clock) {
		assert(clock, "clock");

		this.messages = [];
		this.completeAfter = completeAfter;
		this.clock = clock;
		this.ops = new Sequence(true);
		this.ended = false;
	}

	_next_operation( perform ) {
		return this.ops.next( () => {
			return this.clock.promiseIn( this.completeAfter, perform );
		});
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

	hasMessages( ){
		return this.waiting.length > 0;
	}

	retreive() {
		return this.waiting.splice(0,1)[0]
	}
}

class Spool {
	constructor( consumerFactory, consumerExpiry = 5, delayTolerance = 5, storage, clock ) {
		assert(clock, "clock");
		assert(storage, "storage");
		assert(consumerFactory, "consumer factory");
		this.consumerFactory = consumerFactory;
		//if the consumer is without data for this long, then terminate it
		this.consumerExpiry = consumerExpiry;
		this.delayTolerance = delayTolerance;
		this.clock = clock;
		this.storage = storage;

		this.consumerSequence = new Sequence()
		this.ended = false;
	}

	publish( message ) {
		assert(!this.ended, "ended")
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
		return this.consumerSequence.within_otherwise( this.delayTolerance, async () => {
			return await this.consumer.consume(message)
		}, async () => {
			await this.storage.store(message)

			return this.consumerSequence.next( async () => {
				while(this.storage.hasMessages()){
					const storedMessage = await this.storage.retreive();
					if( storedMessage ){
						await this.publish( storedMessage )
					}else {
						//do thing, we're done
					}
				}
			});
		}, this.clock )
	}

	end() {
		this.ended = true;
		if( this.consumer ){ this.consumer.end() }
		if( this.consumerWatch ){ this.clock.cancel(this.consumerWatch); }
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
		this.spool = new Spool( this.consumerFactory, this.consumerExpiry, 1000, new BufferingStorage(), this.logicalClock );
	});

	function it_has_consumer_count(count, message) {
		it(message, function () {
			assert.equal(this.consumerFactoryCount, count);
		})
	}

	it_has_consumer_count(0, "doesn't immediately create a consumer")

	describe("when first message is published", function() {
		beforeEach( async function() {
			this.message = "damage";
			return this.spool.publish( this.message );
		});

		it_has_consumer_count(1, "creates a new consumer")
		it("sends the consumer the message", function() { assert.deepEqual(this.lastConsumer.messages, [this.message]); })

		describe("before the consumer timeout", function(){
			describe("when sent a second message", function(){
				beforeEach(async function(){
					this.second = "make it on our own"
					return this.spool.publish(this.second);
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
				beforeEach(async function () {
					this.secondMessage = "Wisemen say life is suffering"
					await this.spool.publish(this.secondMessage)
				});

				it_has_consumer_count(2, "creates a new consumer")

				it("sends the message to the consumer", function(){
					assert.deepEqual(this.lastConsumer.messages, [this.secondMessage]);
				})
			});
		});
	});

	describe('when a message is published while another is sending', function () {
		beforeEach( function() {
			this.consumerExpiry = 100;
			this.transmissionWait = 5;
			this.consumerWait = 15;

			this.logicalClock = new LogicalTimer();
			this.lastConsumer = null;
			this.consumerFactoryCount = 0;
			this.consumerFactory = () => {
				this.consumerFactoryCount++;
				this.lastConsumer = new DelayedConsumer( this.consumerWait, this.logicalClock );
				return this.lastConsumer;
			}
			this.storage = new BufferingStorage()
			this.spool = new Spool( this.consumerFactory, this.consumerExpiry, this.transmissionWait, this.storage, this.logicalClock );

			this.firstMessage = Symbol('first')
			this.secondMessage = Symbol('second')
			this.spool.publish(this.firstMessage)
			this.spool.publish(this.secondMessage)
		});

		afterEach( function(){
			this.spool.end();
		})

		describe('and the storage tolerance elapses', function () {
			beforeEach(function () {
				this.logicalClock.advance(this.consumerWait)
			})

			it("sends the second message to storage", function () {
				assert.deepEqual(this.storage.waiting, [this.secondMessage])
			})

			describe('when the first message sends', function () {
				beforeEach(function () {
					this.logicalClock.advance(this.consumerWait)
				})

				it('sends the message from storage', function () {
					assert.deepEqual(this.lastConsumer.messages, [this.firstMessage, this.secondMessage]);
				})
			});
		});
	});
});
