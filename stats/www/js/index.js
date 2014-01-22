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
	
	// Sorts Array by subkey
	sortBySubKey: function(array, key, subkey) {
		return array.sort(function(a, b) {
			var x = a[key][subkey]; var y = b[key][subkey];
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		});
	},
	
	// JSON Ajax call to stats.rugbywuerenlos.ch
	// seems to work on phone, but does not locally
	// get json array of all players
	getPlayers: function() {
		
		console.log("getPlayers called");
	
		var url = "http://stats.rugbywuerenlos.ch/jsonp/players?callback=?";
		
		document.getElementById("title").innerHTML = "Topscorer";
		
		$.getJSON(url, function(jsonp){
			var os = app.sortBySubKey(jsonp,'fields','firstName');
					
			// cache seasons
			var dataToStore = JSON.stringify(os);
			localStorage.setItem('players', dataToStore);
			console.log("localStorage set");			
			
			document.getElementById("players").innerHTML = "<ul>";
			for (var i = 0; i < os.length; i++) {
				document.getElementById("players").innerHTML += "<li>"+os[i].fields.firstName+" "+os[i].fields.lastName+" ("+os[i].fields.position+")</li>";
			}
			document.getElementById("players").innerHTML += "</ul>";
			});
			$.sidr('close');
		},
		
		// get json array of all games
		getGames: function() {
		
			console.log("getGames called");
			var url = "http://stats.rugbywuerenlos.ch/jsonp/games?callback=?";
			$.getJSON(url, function(jsonp){
				var os = app.sortBySubKey(jsonp,'fields','date');
				
				// cache games
				var dataToStore = JSON.stringify(os);
				localStorage.setItem('games', dataToStore);
			});
		},
		// get json array of all results
		getResults: function() {
		
			console.log("getResults called");
			document.getElementById("title").innerHTML = "Ergebnisse";	
			app.getGames();
			
			var games = JSON.parse(localStorage.getItem('games'));			
			document.getElementById("players").innerHTML = "<ul>";
			for (var i = 0; i < games.length; i++) {
				if (games[i].fields.pointsO != null) {
					document.getElementById("players").innerHTML += "<li>"+games[i].fields.date+": "+games[i].fields.opponent+"</li>";
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
			for (var i = 0; i < games.length; i++) {
				if (games[i].fields.pointsO == null) {
					document.getElementById("players").innerHTML += "<li>"+games[i].fields.date+": "+games[i].fields.opponent+"</li>";
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
