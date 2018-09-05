//Initialize DB
let dbfunc = require('./data/db.js');

//Initialize items
const fs = require("fs");
let itemList = JSON.parse(fs.readFileSync("./values/items.json", "utf8"));
let activesList = JSON.parse(fs.readFileSync("./values/actives.json", "utf8"));

//CONSTANTS
//Item types
const IMMEDIATE = "immediate"; //Consume with no active state, no duration
const CONSUME = "consume"; //Consume with active state, has duration
const NONCONSUME = "non-consume"; //Don't consume with no active state, could have duration
const TOGGLE = "toggle"; //Don't consume with active state. Stays active until used again.

//Battle states
const PREBATTLE = "pre-battle"; //Before battle begins
const PRERESULTS = "pre-results"; //After battle ends but before results are calculated
const POSTRESULTS = "post-results"; //After results are calculated

let battlefunc = require('./command/battle.js');

//EXPORTS
exports.IMMEDIATE = IMMEDIATE;
exports.CONSUME = CONSUME;
exports.NONCONSUME = NONCONSUME;
exports.TOGGLE = TOGGLE;

exports.PREBATTLE = PREBATTLE;
exports.PRERESULTS = PRERESULTS;
exports.POSTRESULTS = POSTRESULTS;

/**
* Do a particular function based on the eventId (item, equip, effect, skill, etc.) and consume eventId
*/
exports.immediate = function(message, character, eventId, event, amount){

	var result = message.member.displayName + " has used " + event.name + " x" + amount;

	switch(eventId){
	
		case 'battle_ticket':
		
			if((character.battlesLeft + amount) <= 3){
				
				for(var i = 0; i < amount; i++){
					
					var index = character.items.indexOf(eventId);
					character.items.splice(index, 1);
				}
				character.battletime -= 3600000 * amount;
			}
			else{
				
				result = "You either already have all battle attempts available or attempted to use too many battle tickets.";
			}
			break;
			
		case 'challenge_ticket':
		
			if((character.challengesLeft + amount) <= 3){
				
				for(var i = 0; i < amount; i++){
					
					var index = character.items.indexOf(eventId);
					character.items.splice(index, 1);
				}
				character.challengetime -= 3600000 * amount;
			}
			else{
				
				result = "You already have all challenge attempts available or attempted to use too many challenge tickets.";
			}
			break;
			
		case 'antidote':
		
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
				
				result = message.member.displayName " has used an antidote";
			}
			else{
				
				result = "You are not poisoned at this moment";
			}
			break;
			
		default:
			//Do nothing
			break;
	}
	
	message.channel.send(result);
	
	//Save character
	dbfunc.updateCharacter(character);
}

/**
* Add consumed eventId to active list.
*/
exports.consume = function(message, character, eventId, event, eventStates, amount){

	var result = message.member.displayName + " has used " + event.name + " x" + amount;
	
	dbfunc.getDB().collection("actives").findOne({"_id": character._id + eventId, "character": character._id, "id": eventId}, function(err, active){
		
		var wasConsumed = true;
		if(active == null){
			
			pushToState(character, eventId, event, eventStates, amount);
		}
		else{
			
			//Extend duration of consumable
			//All consume types should have a duration. Otherwise, it's an immediate
			if(active.duration == 10 || active.duration + (event.duration * amount) > 10){
				
				result = "You can't have an active for longer than 10 battles";
				wasConsumed = false;
			}
			else{
				
				active.duration += event.duration * amount;
				dbfunc.updateActive(active);
			}
		}
		if(wasConsumed){
			
			for(var i = 0; i < amount; i++){
				
				var index = character.items.indexOf(eventId);
				character.items.splice(index, 1);
			}
		}
		
		message.channel.send(result);
		
		//Save character
		dbfunc.updateCharacter(character);
	});
}

/**
* Do a particular function based on the eventId (item, equip, effect, skill, etc.) without consuming eventId
*/
exports.nonconsume = function(message, character, eventId, event){

	//TODO add more item/equip functions
}

/**
* Activate or deactivate the eventId.
*/
exports.toggle = function(message, character, eventId, event, eventStates){

	dbfunc.getDB().collection("actives").findOne({"_id": character._id + eventId, "character": character._id, "id": eventId}, function(err, active){

		//Deactivate
		if(active != null){
			
			spliceFromState(character, eventId, event, eventStates, active);
			message.channel.send(message.member.displayName + " has deactivated " + event.name);
		}
		//Activate
		else{
			
			pushToState(character, eventId, event, eventStates, null);
			message.channel.send(message.member.displayName + " has activated " + event.name);
		}
		
		//Save character
		dbfunc.updateCharacter(character);
	});
}

/**
* Pre battle calculations.
*/
exports.prebattle = function(message, args, character, battleState, actives, grumbo){
	
	battleState.levelDiffActual = character.level - args[3];
	
	//Prebattle modifiers
	var chanceMod = 0;
	var levelDiffMod = 0;
	
	//Prebattle Grumbo effects
	grumbo.prebattle.forEach(function(eventId){
		
		switch(eventId){
			
			//None right now
			
			default:
				//Do nothing
				break;
		}
	});
	
	//Prebattle character active functions
	character.prebattle.forEach(function(eventId){
		
		switch(eventId){
			
			case 'battle_potion':
			
				if(battleState.levelDiffActual >= 0) chanceMod += 5;
				else if(battleState.levelDiffActual >= -5) chanceMod += 4;
				else if(battleState.levelDiffActual >= -10) chanceMod += 3;
				else if(battleState.levelDiffActual >= -15) chanceMod += 2;
				else chanceMod += 1;
				reduceDuration(character, character.prebattle, eventId, actives);
				break;
			
			default:
				//Do nothing
				break;
		}
	});
	
	//Calculate prebattle variables
	battleState.levelDiff = character.level - args[3] + levelDiffMod;
	battleState.chance = 50 + (battleState.levelDiff * 2) + Math.floor(Math.random() * 6) - 3; + chanceMod;
	if(battleState.levelDiff < -15){
		
		battleState.chance -= (Math.floor(Math.random() * 3) + 1);
	}
	if(battleState.chance > 95){
		
		battleState.chance = 95;
	}
	else if(battleState.chance < 5){
		
		battleState.chance = 5;
	}
}

/**
* Pre results calculations. //TODO
*/
exports.preresults = function(message, character, battleState, actives, grumbo){
		
	//Preresults modifiers
	
	//Preresults Grumbo effects
	grumbo.preresults.forEach(function(eventId){
		
		switch(eventId){
			
			//None right now
			
			default:
				//Do nothing
				break;
		}
	});
	
	//Preresults character active functions
	character.prebattle.forEach(function(eventId){
		
		switch(eventId){
			
			//None right now
			
			default:
				//Do nothing
				break;
		}
	});
	
	//Calculate preresults variables
}

/**
* Post results calculations. //TODO
*/
exports.postresults = function(message, character, battleState, actives, grumbo){
		
	//Postresults modifiers
	
	//Postresults Grumbo effects
	grumbo.postresults.forEach(function(eventId){
		
		switch(eventId){
			
			//None right now
			
			default:
				//Do nothing
				break;
		}
	});
	
	//Postresults character active functions
	character.postbattle.forEach(function(eventId){
		
		switch(eventId){
			
			//None right now
			
			default:
				//Do nothing
				break;
		}
	});
	
	//Calculate postresults variables
}

/**
* Push to character state active.
*/
function pushToState(character, eventId, event, eventStates, amount){
	
	var totalDuration = event.duration;
	if(amount != null){
		
		totalDuration = totalDuration * amount;
	}
	var id = character._id + eventId;
	var newActive = {
		
		_id: id,
		character: character._id,
		id: eventId,
		name: event.name,
		duration: totalDuration
	}
	
	eventStates.forEach(function(eventState){
		
		switch(eventState){
			
			case PREBATTLE:
			
				character.prebattle.push(eventId);
				break;
				
			case PRERESULTS:
			
				character.preresults.push(eventId);
				break;
				
			case POSTRESULTS:
			
				character.postresults.push(eventId);
				break;
				
			default:
				//Do nothing
				break;
		}
	});
	
	dbfunc.updateActive(newActive);
}

/**
* Splice from character state active.
*/
function spliceFromState(character, eventId, event, eventStates, active){

	eventStates.forEach(function(eventState){

		switch(eventStates){
			
			case PREBATTLE:
			
				var index = character.prebattle.indexOf(eventId);
				character.prebattle.splice(index, 1);
				break;
				
			case PRERESULTS:
			
				var index = character.preresults.indexOf(eventId);
				character.preresults.splice(index, 1);
				break;
				
			case POSTRESULTS:
			
				var index = character.postresults.indexOf(eventId);
				character.postresults.splice(index, 1);
				break;
				
			default:
				//Do nothing
				break;
		}
	});
	
	dbfunc.removeActive(active);
}

/**
* Reduce the duration of an active.
*/
function reduceDuration(character, characterState, eventId, actives){
	
	var active;
	for(var i = 0; i < actives.length; i++){
		
		if(actives[i].id == eventId){
			
			active = actives[i];
			break;
		}
	}
	if(active.duration <= 1){
	
		var index = characterState.indexOf(eventId);
		characterState.splice(index, 1);
		dbfunc.removeActive(active);
	}
	else{
		
		active.duration -= 1;
		dbfunc.updateActive(active);
	}
}
