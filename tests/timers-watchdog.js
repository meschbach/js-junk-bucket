const mocha = require("mocha")
const assert = require("assert")
const {LogicalTimer, WatchDog} = require('../timers')

describe( "WatchDog", function () {
	beforeEach( function () {
		const timer = new LogicalTimer();
		this.timer = timer;

		this.tripped = false;
		this.watchdog = new WatchDog(2, () => {
			this.tripped = true
		}, this.timer)
	});

	function it_is_untripped(){
		it("is untripped", function(){
			assert(!this.tripped, "watchdog timer tripped")
		})
	}

	function it_is_tripped(){
		it("is tripped", function(){
			assert(this.tripped, "watchdog timer wasn't tripped")
		})
	}


	describe("on creation", function(){
		it_is_untripped()
	})

	describe("before expiration", function(){
		beforeEach( function() {
			this.timer.advance(1)
		})

		it_is_untripped()

		describe("when reset", function () {
			beforeEach(function () {
				this.watchdog.reset();
			})

			it_is_untripped()

			describe("when original period elapses", function () {
				beforeEach(function () {
					this.timer.advance(1);
				})
				it_is_untripped()
			})

			describe("when new period elapses", function () {
				beforeEach(function () {
					this.timer.advance(2);
				})
				it_is_tripped()
			})
		})
	})

	describe("after expiration", function(){
		beforeEach( function() {
			this.timer.advance(2)
		})

		it_is_tripped()
	})
});
