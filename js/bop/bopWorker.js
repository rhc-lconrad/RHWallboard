//
// The Web Worker for RHWallboard
//
// It's just a simple thing
//
var getData = function() {
	// This is our message prototype; we comminicate with the app via JSON-encapsulated objects
	var message = {
		type: 'data',
		data: false,
		length: 0
	};

	
	var rq = new XMLHttpRequest();

	// We expect to find our data as plaintext in /wallboard.html
	// We'll be using syncronous XHR to prevent odd occurrences of reading the same file twice
	// at the same time. 
	rq.open('GET', '/wallboard.html', false);
	rq.send(null);

	if (rq.status >= 200 && rq.status < 400) {
		var resp = rq.responseText;

		if (resp.length === 0 || typeof resp != "string") {
			message.data = {activeCalls:[], extensions:{}, queues:{} };
		} else {
			message.data = JSON.parse(resp);
		}
	}

	postMessage(JSON.stringify(message));

	// Init the next read 2sec after the current read completes
	setTimeout('getData()', 2000);
};

// Get it running
console.log('bopWorker has been initialized');
getData();
