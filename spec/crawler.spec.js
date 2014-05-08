var crawler = require('../crawler');
var nock = require('nock');

var mockDomain = nock("http://mytargetdomain.com").persist()
			.get('/')
			.reply(200, "<html><body><a href='link1'>first link</a></body></html>")
			.get('/link1')
			.reply(200, "<html><body><a href='link2'>second link</a><img src='image.jpg'></img></body></html>")
			.get('/link2')
			.reply(200, "<html><body><a href='link3'>third link</a><a href='link1'>repeat link</a></body></html>")
			.get('/link3')
			.reply(200, "<html><body><a href='link4'>fourth link</a></body></html>")
			.get('/link4')
			.reply(200, "<html><body><a href='link5'>fifth link</a></body></html>")
			.get('/link5')
			.reply(200, "<html><body><a href='link6'>6th link</a></body></html>");
		



describe("crawler", function(){
	it("will set the index page text to the default text", function(done){
	 	crawler.crawl("http://mytargetdomain.com", 4, function(root){
	 		expect(root.linkText).toBe("Index page for http://mytargetdomain.com");
	 		done();
	 	});
	 });

	it("will crawl exactly 4 levels deep and stop", function(done){

		crawler.crawl("http://mytargetdomain.com", 4, function(root){
			expect(root.childlinks[0].linkText).toBe("first link");
			expect(root.childlinks[0].childlinks[0].linkText).toBe("second link");
			expect(root.childlinks[0].childlinks[0].childlinks[0].linkText).toBe("third link");
			expect(root.childlinks[0].childlinks[0].childlinks[0].childlinks[0].linkText).toBe("fourth link");
			expect(root.childlinks[0].childlinks[0].childlinks[0].childlinks[0].childlinks).toBeUndefined();
			done();
		});
	});

	it("will not crawl duplicate links", function(done){
		crawler.crawl("http://mytargetdomain.com", 4, function(root){
			expect(root.childlinks[0].childlinks[0].childlinks[0].linkText).toBe("third link");
			expect(root.childlinks[0].childlinks[0].childlinks[0].childlinks.length).toBe(1);
			done();
		});
	});

	iit("will record static assets in a page", function(done){
		crawler.crawl("http://mytargetdomain.com", 4, function(root){
			expect(root.childlinks[0].childlinks[0].linkText).toBe("second link");
			expect(root.childlinks[0].assets.length).toBe(1);
			 expect(root.childlinks[0].childlinks[0].assets[0]).toBe("image.jpg");
			done();
		});
	});
	

});