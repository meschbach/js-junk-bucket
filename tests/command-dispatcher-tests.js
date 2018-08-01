const {expect} = require("chai");

const {CommandDispatcher} = require("../command-dispatcher");

function fuse() {
	let handler = function(){
		handler.called = true;
	}
	handler.called = false;
	return handler;
}

describe("CommandDispatch", function(){
	describe('when dispatching a nonexistent command', function () {
		it("invokes the default handler", function(){
			const dispatcher = new CommandDispatcher( fuse() );
			dispatcher.dispatch({command: "non-existent"});
			expect( dispatcher.defaultHandler.called ).to.eq(true);
		});
	});

	describe('when registering a handler', function () {
		describe("and it is passed in", function(){
			it("dispatches to the handler", function(){
				const cmd = "we-will-rock-you";
				const target = fuse();
				const dispatcher = new CommandDispatcher( );
				dispatcher.register(cmd, target);
				dispatcher.dispatch({command: cmd});
				expect( target.called ).to.eq(true);
			});
		});

		describe("and a different command is invoked", function () {
			it("does not invoke the handler", function () {
				const cmd = "we-will-rock-you";
				const target = fuse();
				const dispatcher = new CommandDispatcher( );
				dispatcher.register(cmd, target);
				dispatcher.dispatch({command: "don't call it"});
				expect( target.called ).to.eq(false);
			});
		});

		describe("when reset", function(){
			describe("and the command is invoked", function () {
				it("does not call the handler", function () {
					const cmd = "we-will-rock-you";
					const target = fuse();
					const dispatcher = new CommandDispatcher( );
					dispatcher.register(cmd, target);
					dispatcher.reset();
					dispatcher.dispatch({command: cmd});
					expect( target.called ).to.eq(false);
				});
			});
		});
	});
});

