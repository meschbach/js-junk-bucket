const mocha = require("mocha")
const assert = require("assert")
const {LogicalTimer} = require('../timers')

describe( "LogicalTimer", function () {
	beforeEach( function () {
		const timer = new LogicalTimer();

		this.timer = timer;
	});

	describe("with no alarms", function () {
		it("will still advance", function () {
			this.timer.advance(10);
		});
	});

	describe('when an alarm is added in 5 terms', function () {
		beforeEach(function () {
			this.invoked = false;
			this.timer.notifyIn(5, () => {
				this.invoked = true;
			});
		});

		it("is not immediately called", function () { assert(!this.invoked); });

		describe('when advanced by 4 ticks', function () {
			beforeEach(function () {
				this.timer.advance(4);
			});

			it("is not called", function () { assert(!this.invoked); });

			describe('when advanced by 1 additional tick', function () {
				beforeEach(function () {
					this.timer.advance(1);
				});

				it("is called", function () {
					assert(this.invoked);
				});
			});


			describe('when advanced by 30 additional tick', function () {
				beforeEach(function () {
					this.timer.advance(30);
				});

				it("is called", function () {
					assert(this.invoked);
				});
			});
		});

		describe('and is advanced by 5 terms', function () {
			beforeEach( function () {
				this.timer.advance(5)
			})
			it("is called", function () { assert(this.invoked); });
		});
	});
});
