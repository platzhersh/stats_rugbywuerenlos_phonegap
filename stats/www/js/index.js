/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
		app.getIndex();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
		console.log("device ready");
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },	
	
	// Sorts Array by key
	sortByKey: function(array, key) {
		return array.sort(function(a, b) {
			var x = a[key]; var y = b[key];
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		});
	},
	
	// Sorts Array by subkey
	sortBySubKey: function(array, key, subkey) {
		return array.sort(function(a, b) {
			var x = a[key][subkey]; var y = b[key][subkey];
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		});
	},
	
	// parse Date
	parseDate: function(input) {
		var parts1 = input.split('-');
		var parts2 = parts1[2].split('T');
		var parts3 = parts2[1].split(':');
		// new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
		return { "year" : parts1[0], "month" : parts1[1], "day" : parts2[0], "hour" : parts3[0], "min" : parts3[1], "s" : parts3[2] };
	},
	
	getIndex: function() {
		document.getElementById("title").innerHTML = "Home";
		document.getElementById("players").innerHTML = "<p>under construction</p>";
		$.sidr('close');
	},
	
	// JSON Ajax call to stats.rugbywuerenlos.ch
	
	// helper function to call the API
	getJson: function(model, sortby) {
		var url = "http://stats.rugbywuerenlos.ch/jsonp/"+model+"?callback=?";
		$.getJSON(url, function(jsonp){
		var os = app.sortBySubKey(jsonp,'fields',sortby);
		
		// cache games
		var dataToStore = JSON.stringify(os);
		localStorage.setItem(model, dataToStore);
	});
	},
	
	// get games
	getGames: function() {
		console.log("getGames called");
		app.getJson('games', 'date');
	},
	// get json array of all games
	getPoints: function() {
		console.log("getPoints called");
		app.getJson('points', 'game');
	},
	getPointTypes: function() {
		console.log("getPointTypes called");
		app.getJson('pointtypes', 'name');
	},
	
	getPlayers: function() {
		console.log("getPointTypes called");
		app.getJson('players', 'firstName');
	},
	
	getTopScorerList: function() {
		console.log("getTopScorerList called");
		app.getPlayers();
		app.getPoints();
		app.getPointTypes();
		
		var players = JSON.parse(localStorage.getItem('players'));
		var points = JSON.parse(localStorage.getItem('points'));
		var ptypes = JSON.parse(localStorage.getItem('pointtypes'));
		var tid = 1; var pid = 5; var cid = 3; var did = 4;
		var pts, tries, penalties, conversions, dropgoals;

		var json = "["; 
		for (var i = 0; i < players.length; i++) {
			
			pts = tries = penalties = conversions = dropgoals = 0;
			
			for (var j = 0; j < points.length; j++) {
				if (players[i].pk == points[j].fields.player) {
					switch (points[j].fields.pointType) {
						case tid: tries++; pts += 5; break;
						case pid: penalties++; pts += 3; break;
						case cid: conversions++; pts += 2; break;
						case did: dropgoals++; pts += 3; break;
					}
				}
			}
			if (pts > 0) {
				if (json !== "[") json += ",";
				json += '{ "firstName" : "' +players[i].fields.firstName+
					'", "lastName" : "'+players[i].fields.lastName+
					'", "points" : '+pts+
					', "tries" : '+tries+
					', "conversions" : '+conversions+
					', "penalties" : '+penalties+
				"}";
			}
		}
		json += "]";
		localStorage.setItem('topscorerlist', json);
	},
	
	// get json array of all games
	getTopScorers: function() {
	
		console.log("getTopScorers called");
		document.getElementById("title").innerHTML = "Topscorer";
		var list = JSON.parse(localStorage.getItem('topscorerlist'));
		var olist = app.sortByKey(list, 'points');
		
		var html =  "<table><thead><tr>" +
		"<th>Name</th>"+
		"<th><span class='mobile'>Pts.</span><span class='nomobile'>Punkte</span></th>"+
		"<th><span class='mobile'>Tr.</span><span class='nomobile'>Tries</span></th>"+
		"<th><span class='mobile'>Conv.</span><span class='nomobile'>Conversions</span></th>"+
		"<th><span class='mobile'>Pen.</span><span class='nomobile'>Penalties</span></th>"+
		"</thead><tbody>"; 
		for (var i = olist.length-1; i >= 0; i--) {
			html += "<tr><td><span class='nomobile'>"+olist[i].firstName+"</span><span class='mobile'>"+olist[i].firstName.substring(0,1)+".</span> "+olist[i].lastName+"</td>"+
			"<td>"+olist[i].points+"</td>"+
			"<td>"+olist[i].tries+"</td>"+
			"<td>"+olist[i].conversions+"</td>"+
			"<td>"+olist[i].penalties+"</td>"+
			"</tr>";
		}
		html += "</tbody></table>";
		document.getElementById("players").innerHTML = html;
		$.sidr('close');
	},
	
	// get json array of all results
	getResults: function() {
	
		console.log("getResults called");
		document.getElementById("title").innerHTML = "Ergebnisse";	
		app.getGames();
		app.getPoints();
		app.getPointTypes();
		
		var games = JSON.parse(localStorage.getItem('games'));
		var ptypes = JSON.parse(localStorage.getItem('pointtypes'));
		var date, points, pointsRCW, html, f;
		document.getElementById("players").innerHTML = "<ul>";
		for (var i = games.length-1; i >= 0; i--) {
			if (games[i].fields.pointsO != null) {
				date = app.parseDate(games[i].fields.date);
				pointsRCW = 0;
				html = "<li>"+date.day+"."+date.month+"."+date.year+" - "+games[i].fields.opponent+" - ";
				points = JSON.parse(localStorage.getItem('points'));
				for (var j = 0; j < points.length; j++) {
					if (points[j].fields.game == games[i].pk) {
					f = function(element) { return element.pk == points[j].fields.pointType; };
						console.log(games[i].fields.opponent+" "+points[j].pk+" "+pointsRCW);
						pointsRCW += ptypes.filter(f)[0].fields.value;
						}
				}
				html += pointsRCW+":"+games[i].fields.pointsO+"</li>"
				document.getElementById("players").innerHTML += html;
			}
		}
		document.getElementById("players").innerHTML += "</ul>";
	$.sidr('close');
	},
	
	// get json array of all results
	getGameplan: function() {
	
		console.log("getGameplan called");
		document.getElementById("title").innerHTML = "Spielplan";	
		app.getGames();
		
		var games = JSON.parse(localStorage.getItem('games'));			
		document.getElementById("players").innerHTML = "<ul>";
		var date;
		for (var i = 0; i < games.length; i++) {
			if (games[i].fields.pointsO == null) {
				date = app.parseDate(games[i].fields.date);
				document.getElementById("players").innerHTML += "<li>"+date.day+"."+date.month+"."+date.year+", "+date.hour+":"+date.min+" - "+games[i].fields.opponent+"</li>";
			}
		}
		document.getElementById("players").innerHTML += "</ul>";
	$.sidr('close');
	},
	
	// get json array of seasons
	getSeasons: function() {
	
		console.log("getSeasons called");
	
		var url = "http://stats.rugbywuerenlos.ch/jsonp/seasons?callback=?";
		$.getJSON(url, function(jsonp){
			var os = app.sortBySubKey(jsonp,'fields','start');
				
				// cache seasons
				var dataToStore = JSON.stringify(os);
				localStorage.setItem('seasons', dataToStore);
				console.log("localStorage set");
				
				document.getElementById("players").innerHTML = "<ul>";
				for (var i = 0; i < os.length; i++) {
					document.getElementById("players").innerHTML += "<li>"+os[i].fields.start+"/"+os[i].fields.start+1+"</li>";
				}
				document.getElementById("players").innerHTML += "</ul>";
		});
		$.sidr('close');
	},
		
	clearPlayers: function() {
		console.log("clearPlayers called");
		document.getElementById("players").innerHTML = "";
	}
};
