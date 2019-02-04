const {expect} = require("chai");
const {MemoryEventStore} = require("../events/v1");

describe("MemoryEventStore", function(){
	describe("Given a valid store", function(){
		beforeEach(function () {
			this.store = new MemoryEventStore();
		});

		describe("When given an event stream", function(){
			beforeEach(async function () {
				this.objects = [];
				this.momentos = [];
				for( let i = 0; i < 150; i++ ){
					const e = {index: i};
					const momento = await this.store.publish(e);
					this.momentos.push(momento);
					this.objects.push(e);
				}
			});

			it("Replays them in order with events", async function(){
				const events = [];
				await this.store.replay((momento, event) => {
					events.push(event);
				});
				expect(events).to.deep.eq(this.objects);
			});

			it("Replays them in order with momentos", async function(){
				const momentos = [];
				await this.store.replay((momento, event) => {
					momentos.push(momento);
				});
				expect(momentos).to.deep.eq(this.momentos);
			});

			it("has the correct event count", async function() {
				expect(await this.store.countRecords()).to.eq(this.objects.length);
			});

			it("can retrieve a specific momento", async function() {
				const index = Math.floor(Math.random() * this.momentos.length);
				console.log("Using index ", index);
				const event = await this.store.byMomento(this.momentos[index]);
				expect(event).to.deep.eq(this.objects[index]);
			})
		});
	});
});
