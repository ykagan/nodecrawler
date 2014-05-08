var crawler = require("./crawler");

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

//number of levels to go in site hierarchy 
var maxLevel = 4;
if(process.argv.length > 3 && parseInt(process.argv[3]) > 0)
{
	maxLevel = process.argv[3];
}


crawler.crawl(domain, maxLevel);