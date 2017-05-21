// test.js
var st = require('../index.js'),
		expect = require("chai").expect;

st.load(__dirname + '/test-scene.xml');
st.next(0);

// expect: start,abc,def,ghi,jkl foo,mno bar,pqr foo,0 > abc,1 > def,abc,def,ghi,vwx,fin
var test = st.log.split(',');

describe("Sweettext Library", function() {
	it("Load and start", function() {
		expect(test[0]).to.equal("start");
		expect(test[1]).to.equal("abc");
	});
	it("Go to nesting sweet", function() {
		expect(test[2]).to.equal("def");
	});
	it("Continue after dead end", function() {
		expect(test[3]).to.equal("ghi");
	});
	it("Set and display a basic insert", function() {
		expect(test[4]).to.equal("jkl foo");
	});
	it("Set and display a true insert", function() {
		expect(test[5]).to.equal("mno bar");
	});
	it("Set and display a false insert", function() {
		expect(test[6]).to.equal("pqr foo");
	});
	it("Display choices", function() {
		expect(test[7]).to.equal("0 > abc");
		expect(test[8]).to.equal("1 > def");
	});
	it("Make a choice", function() {
		expect(test[9]).to.equal("abc");
		expect(test[10]).to.equal("def");
		expect(test[11]).to.equal("ghi");
	});
	it("Continue after choice", function() {
		expect(test[12]).to.equal("vwx");
	});
	it("Finish at end of scene", function() {
		expect(test[test.length - 1]).to.equal("fin");
	});
});
