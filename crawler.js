var request = require('request'),
	cheerio = require('cheerio'),
	async = require('async'),
	format = require('util').format;


//default domain to crawl
var domain = "http://joingrouper.com";
if(process.argv.length < 3)
{
	console.error("Please provide a domain name");
	return;
}
else
{
	domain = process.argv[2];
}
//datastructure to hold the sitemap
var root = {
	linkText: "Index page for " + domain,
	linkUrl: ""
};
//queue of links to visit
var linkQueue = [root];
//number of links visited
var numVisited = 0;
//associative array of links that have been visited
//used to ensure same link isn't visited twice
var visitedUrls = {};

//number of levels to go in site hierarchy 
var maxLevel = 4;
if(process.argv.length > 3 && parseInt(process.argv[3]) > 0)
{
	maxLevel = process.argv[3];
}
var curLevel = 0;

var isRelativeUrl = function(url){
	var r = new RegExp('^(?:[a-z]+:)?//', 'i'); //Should cover the cases of http(s)://, //, HTTP, etc
	return !r.test(url);
}

//removes hashes and query parameters from url - attempt to ensure unique URLs
var trimUrl = function(url) {
	if(url)
		url = url.split("#").pop();
	if(url)
		url = url.split('?').pop();
	if(url)
		url = "/" + url.substring(url.lastIndexOf('/') + 1);
	return url;
}

var urlIsValid = function(url){
	return url && visitedUrls[url] == null &&
			url.indexOf("mailto") == -1 &&
			isRelativeUrl(url)
}

var getLinks = function(callback){
	//get the next set of links to visit
	var links = linkQueue.slice(numVisited);
	return async.eachLimit(links, 10, function(link, callback){
		var link = link; //make sure link is available in closure;
		console.warn("%s: Requesing %s", numVisited, domain + link.linkUrl);
		request(domain + link.linkUrl, function(err, response, body){
			if(err) {
				//throw err;
				console.error('request failed: %s', err);
				return;
			}
			numVisited++;
			
			var $ = cheerio.load(body);
			//parse and process child links
			$("a").each(function(){
				var childlink = {
					linkText: $(this).text().trim(),
					linkUrl: trimUrl($(this).attr('href'))
				};
				
				if(urlIsValid(childlink.linkUrl)){
					if(!link.childlinks)
						link.childlinks = [];
					link.childlinks.push(childlink);
					linkQueue.push(childlink);
					visitedUrls[childlink.linkUrl] = link;
				}
			});
			//parse asset references
			$("img, link, script").each(function(){
				//console.log('asset found %s', $(this).html());
				if($(this).attr("src")){
					if(!link.assets)
						link.assets = [];
					link.assets.push($(this).attr("src"));

				}
			});
			callback();
		});
	},
	function(err){
		callback();
	});
};

async.doWhilst(
	function(callback){
		getLinks(callback);
		curLevel++;
	},
	function(){
		return linkQueue.length > numVisited  && curLevel < maxLevel;
	},
	function(err){
		console.log(JSON.stringify(root, null, 4));
	}
);
