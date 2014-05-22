//
// Dummy data for testing the UI
//
/*
var bopData = {
 "extensions" : {
	  "102" : {
		 "direction" : "outbound",
		 "num" : "102",
		 "activeCall" : "102",
		 "status" : "ringing"
	  },
	  "720" : {
		 "direction" : "inbound",
		 "num" : "720",
		 "activeCall" : "100",
		 "status" : "ringing"
	  }
   },

   "queues" : {
	  "200" : {
		 "name" : "200"
	  },
	  "default" : {
		 "name" : "default"
	  },
	  "100" : {
		 "name" : "100",
		 "member_stats" : {
			"104" : {
			   "Status" : "1",
			   "Paused" : "0",
			   "Membership" : "dynamic",
			   "Penalty" : "0",
			   "CallsTaken" : "0",
			   "LastCall" : "0",
			   "Location" : "Local/104@from-queue"
			},
			"103" : {
			   "Status" : "1",
			   "Paused" : "0",
			   "Membership" : "dynamic",
			   "Penalty" : "0",
			   "CallsTaken" : "0",
			   "LastCall" : "0",
			   "Location" : "Local/103@from-queue"
			},
			"106" : {
			   "Status" : "1",
			   "Paused" : "0",
			   "Membership" : "dynamic",
			   "Penalty" : "0",
			   "CallsTaken" : "0",
			   "LastCall" : "0",
			   "Location" : "Local/106@from-queue"
			},
			"102" : {
			   "Status" : "1",
			   "Paused" : "0",
			   "Membership" : "dynamic",
			   "Penalty" : "0",
			   "CallsTaken" : "0",
			   "LastCall" : "0",
			   "Location" : "Local/102@from-queue"
			},
			"108" : {
			   "Status" : "1",
			   "Paused" : "0",
			   "Membership" : "dynamic",
			   "Penalty" : "0",
			   "CallsTaken" : "1",
			   "LastCall" : "1400567786",
			   "Location" : "Local/108@from-queue"
			},
			"105" : {
			   "Status" : "1",
			   "Paused" : "0",
			   "Membership" : "dynamic",
			   "Penalty" : "0",
			   "CallsTaken" : "0",
			   "LastCall" : "0",
			   "Location" : "Local/105@from-queue"
			},
			"110" : {
			   "Status" : "1",
			   "Paused" : "0",
			   "Membership" : "dynamic",
			   "Penalty" : "0",
			   "CallsTaken" : "0",
			   "LastCall" : "0",
			   "Location" : "Local/110@from-queue"
			}
		 },
		 "activeUsers" : [
			"102",
			"106",
			"105",
			"108",
			"104",
			"110",
			"103"
		 ],
"activeCalls" : [
			{
			   "num" : "720",
			   "trying_agent" : "103",
			   "Channel" : "SIP/restoreh.voip.kawlin.com-000000b0",
			   "Wait" : "13",
			   "ConnectedLineName" : "103",
			   "ConnectedLineNum" : "103",
			   "CallerIDName" : "CS:720",
			   "Uniqueid" : "1400570487.498",
			   "qtime" : "0:13",
			   "CallerIDNum" : "720"
			}
		 ]

	  },
	  "300" : {
		 "name" : "300"
	  }
   }
};
*/

var bopData = {};	// Init empty dataset
var currentQ = 100;	// Set initial Q on page load
var dw;				// The Worker

// Let's get Foundation Started
$(document).foundation();

// Thanks to MatthewKennedy @
// https://github.com/zurb/foundation/issues/3800
// for this little bit.
$(function() {
	var timer;

	$(window).resize(function() {
		clearTimeout(timer);
		timer = setTimeout(function() {
			$('.inner-wrap').css("min-height", $(window).height() + "px" );
			$('#userPanelsWrap').css("max-height", ($(window).height() - $('#panelTopBar').outerHeight() - $('#panelHeader').outerHeight() - $('#usersPanelHeader').outerHeight()) + "px" );
		}, 40);
	}).resize();
});

var partial_qMenu = function() {
	var qMenuTemplate = _.template($('#tmpl_qMenu').html());
	$('#qMenu').html(qMenuTemplate(bopData));
};

var partial_panelHeader = function() {
	var panelHeader = _.template($('#tmpl_panelHeader').html());
	$('#panelHeader').html(panelHeader(bopData));
};

var partial_panelUsers = function() {
	var panelUsers = _.template($('#tmpl_panelUsers').html());
	$('#panelUsers').html(panelUsers(bopData));
};

var partial_panelCalls = function() {
	var panelCalls = _.template($('#tmpl_panelCalls').html());
	$('#panelCalls').html(panelCalls(bopData));
};

var buildPanel = function() {
	// Only init the more static components of the UI
	partial_qMenu();
	partial_panelHeader();
};

var refreshPanel = function() {
	// (Re-)Init the more dynamic components of the UI
	partial_panelUsers();
	partial_panelCalls();
};

var initWorker = function() {
	// Check if Web Workers are supported
	if (typeof Worker !== "undefined") {
		// Check if OUR worker is initialized
		// If not, get it running
		if (typeof dw == "undefined") {
			dw = new Worker('js/bopWorker.js');
		}
		// The worker gives us JSON-encapsulated messages; Let's listen for them
		dw.onmessage = function(e) {
			var msg = event.data;

			// If the message isn't an error, let's update the data object, and refresh the dynamic bits
			if (msg.type != 'error') {
				bopData = msg.data;
				refreshPanel();
			} else {
				// If it's an error, let's note it on the console
				console.log('bopWorker Error: ', msg.data);
			}
		};
	} else {
		// If we don't support Web Sockets, let's work around it
		setInterval(function() {
			var rq = new XMLHttpRequest();
			var data = false;

			// We're expecting to find the data in this file 
			// We're also assuming that the data will be plaintext, parseable into JSON
			rq.open('GET', '/wallboard.html', false);
			rq.send(null);

			if (rq.status >= 200 && rq.status < 400) {
				// If things look good, let's use it; account for empties, though
				bopData = JSON.parse(rq.responseText || {});
			}
		}, 2000);
	}
};

// A method to kill the worker if ever we need it; it's presently unimplemented
var killWorker = function() {
	dw.terminate();
};

// Here is where the "magic" begins
$(document).ready(function() {
	// Delegate: Listen for changes in the current Q
	$(document.body).on('click', '.func_q_select', function(e) {
		e.preventDefault();
		currentQ = $(this).data('queue');
		buildPanel();
	});

	buildPanel();
	initWorker();
});