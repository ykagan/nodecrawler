var request = require('request'),
	cheerio = require('cheerio'),
	async = require('async'),
	format = require('util').format;

var domain = "";
//datastructure to hold the sitemap
var root = { };
//queue of links to visit
var linkQueue = [];
//number of links visited
var numVisited = 0;
//associative array of links that have been visited
//used to ensure same link isn't visited twice
var visitedUrls = {};
//current depth level
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

var crawl = function(domainToCrawl, maxLevel){
	//queue of links to visit
	domain = domainToCrawl;
	root = {
		linkText: "Index page for " + domain,
		linkUrl: ""
	};
	linkQueue.push(root);

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
}

module.exports = {
	crawl: crawl
};
