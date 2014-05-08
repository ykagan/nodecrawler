Node.js Site Map generator
===================

This console app crawls a single domain to generate a sitemap for this domain.

The sitemap is returned as a JSON object in this format:

	{
	s	linkText: "Text of the anchor tag",
		linkUrl: "/this/url",
		assets:[
			'/assets/home.jpg',
			...
		],
		childLinks:{[
			{
				linkText:'...',
				linkUrl: '...'
			}
			....
		]}
	}

For a sample please refer to sampleresults.json

Installation
-----------
	npm install

Run
-------------
	node crawl [domain] (depth)
	node crawl https://joingrouper.com 4 > results.json

The depth is optional and defaults to 4

Test
---------------
	jasmine-node spec

Note: run npm install jasmine-node -g first for convenience


Implementation Details
---------------

We use node *async* to execute HTTP requests against the target domain (up to a maximum if 10 requests at a time to avoid DDOSing the web server).

*cheerio* handles parsing the results and extracting links. This is much more performant compared to a full DOM implementation like jsdom.

Requests are handled through a queue one depth level at a time, 10 requests at a time to avoid DOSing the server.

Notes
-------------------
The service does not attempt to find assets loaded by Javascript or inside CSS files (including CSS background images). It only identifies assets referenced in the HTML.

To keep the logic simple, we remove all hash tags and query parameters from links and treat these as identical link. In the future this can be an optional setting depending on the site.
