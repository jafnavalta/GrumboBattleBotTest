//Initialize DB functions
let dbfunc = require('../data/db.js');

//Initialize list of actives
const fs = require("fs");
let activesList = JSON.parse(fs.readFileSync("./values/actives.json", "utf8"));

//Initialize state for state constants and functions
let state = require('../state.js');

//Initialize states
//consume/toggle use regular active effects
exports.immediate = {};
exports.nonconsume = {};

/////////////////////////
// IMMEDIATE FUNCTIONS //
/////////////////////////
exports.immediate.battle_ticket = function(message, character, state, eventId, event, amount){
	
	if((character.battlesLeft + amount) <= 3){
				
		for(var i = 0; i < amount; i++){
			
			var index = character.items.indexOf(eventId);
			character.items.splice(index, 1);
		}
		character.battletime -= 3600000 * amount;
	}
	else{
		
		state.result = "You either already have all battle attempts available or attempted to use too many battle tickets.";
	}
}

exports.immediate.challenge_ticket = function(message, character, state, eventId, event, amount){
	
	if((character.challengesLeft + amount) <= 3){
				
		for(var i = 0; i < amount; i++){
			
			var index = character.items.indexOf(eventId);
			character.items.splice(index, 1);
		}
		character.challengetime -= 3600000 * amount;
	}
	else{
		
		state.result = "You already have all challenge attempts available or attempted to use too many challenge tickets.";
	}
}

exports.immediate.antidote = function(message, character, state, eventId, event, amount){
	
	if(character.prebattle.includes('poison')){
				
		var index = character.items.indexOf(eventId);
		character.items.splice(index, 1);
		index = character.prebattle.indexOf('poison');
		character.prebattle.splice(index, 1);
		var _id = character._id + 'poison';
		var active = {
			"_id": _id
		}
		dbfunc.removeActive(active);
		
		state.result = message.member.displayName + " has used an antidote";
	}
	else{
		
		state.result = "You are not poisoned at this moment";
	}
}

exports.immediate.grumbo_ticket = function(message, character, state, eventId, event, amount){
	
	if(character.battlesLeft < 3 || character.challengesLeft < 3){
				
		character.battlesLeft = 3;
		character.challengesLeft = 3;
		var index = character.items.indexOf(eventId);
		character.items.splice(index, 1);
	}
	else{
		
		state.result = "You already have all battle/challenge attempts available.";
	}
}

exports.immediate.duel_converter = function(message, character, state, eventId, event, amount){
	
	if((character.battlesLeft - amount) >= 0 && (character.challengesLeft + amount) <= 3){
				
		for(var i = 0; i < amount; i++){
			
			var index = character.items.indexOf(eventId);
			character.items.splice(index, 1);
		}
		character.battlesLeft -= 1;
		character.challengetime -= (3600000 * amount);
	}
	else{
		
		state.result = "You either have all challenge attempts or no battle attempts available.";
	}
}

//////////////////////////
// NONCONSUME FUNCTIONS //
//////////////////////////