//Initialize DB functions
let dbfunc = require('../data/db.js');

//Initialize list of actives
const fs = require("fs");
let activesList = JSON.parse(fs.readFileSync("./values/actives.json", "utf8"));

//Initialize functions
let charfunc = require('../character/character.js');
let battlefunc = require('../command/battle.js');

//Initialize states
//consume/toggle use regular active effects
exports.immediate = {};
exports.nonconsume = {};

/////////////////////////
// IMMEDIATE FUNCTIONS //
/////////////////////////
exports.immediate.medicine = function(message, character, state, eventId, event, amount){

	if(character.hp < character.maxHP){

		var used = 0;
		for(var i = 0; i < amount; i++){

			var index = character.items.indexOf(eventId);
			character.items.splice(index, 1);
			character.hp += 40;
			used++;
			if(character.hp >= character.maxHP){

				character.hp = character.maxHP;
				break;
			}
		}
		state.result = message.member.displayName + " has used " + event.name + " x" + used;
	}
	else{

		state.result = "You are already at max HP.";
	}
}

exports.immediate.medicine_ex = function(message, character, state, eventId, event, amount){

	if(character.hp < character.maxHP){

		var used = 0;
		for(var i = 0; i < amount; i++){

			var index = character.items.indexOf(eventId);
			character.items.splice(index, 1);
			character.hp += 100;
			used++;
			if(character.hp >= character.maxHP){

				character.hp = character.maxHP;
				break;
			}
		}
		state.result = message.member.displayName + " has used " + event.name + " x" + used;
	}
	else{

		state.result = "You are already at max HP.";
	}
}

exports.immediate.battle_ticket = function(message, character, state, eventId, event, amount){

	if((character.battlesLeft + amount) <= 5){

		state.save = false;
		for(var i = 0; i < amount; i++){

			var index = character.items.indexOf(eventId);
			character.items.splice(index, 1);
		}
		character.battletime -= charfunc.calculateWaitTime(character) * amount;
		var date = new Date();
		var currentTime = date.getTime();
		exports.restockBattles(currentTime, character);
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
		character.challengetime -= charfunc.calculateWaitTime(character) * amount;
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
		index = character.postresults.indexOf('poison');
		character.postresults.splice(index, 1);
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

	if(character.battlesLeft < 5 || character.challengesLeft < 3){

		character.battlesLeft = 5;
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
		character.challengetime -= (charfunc.calculateWaitTime(character) * amount);
	}
	else{

		state.result = "You either have all challenge attempts or no battle attempts available.";
	}
}

exports.immediate.gamblers_coin = function(message, character, state, eventId, event, amount){

	var index = character.items.indexOf(eventId);
	character.items.splice(index, 1);
	var random = Math.random() * 100;
	if(random < 49.5){

		//Gain
		var leftover = (80 + character.experience) % 100;
		var gains = Math.floor(((80 + character.experience)/100));
		charfunc.levelChange(character, gains);
		character.experience = leftover;
		state.result = "The coin flips a fortune of 80 experience!";
	}
	else if(random < 99){

		//Lose
		var leftover = character.experience - 80;
		if(leftover < 0){

			if(character.level == 1){

				character.experience = 0;
			}
			else{

				character.experience = 100 + leftover;
				charfunc.levelChange(character, -1);
			}
		}
		else{

			character.experience = leftover;
		}
		state.result = "You dropped 80 experience with the coin. How unlucky.";
	}
	else{

		//Hit the jackpot
		character.gold += 7777;
		state.result = "Wow! The coin landed on its side, broke the very foundation below you, and revealed 7777 gold buried deep beneath the ground!"
	}
}

exports.immediate.bandages = function(message, character, state, eventId, event, amount){

	if(character.postresults.includes('bleed')){

		var index = character.items.indexOf(eventId);
		character.items.splice(index, 1);
		index = character.postresults.indexOf('bleed');
		character.postresults.splice(index, 1);
		var _id = character._id + 'bleed';
		var active = {
			"_id": _id
		}
		dbfunc.removeActive(active);

		character.resEq += 5;
		character.defEq += 5;
		charfunc.calculateStats(character);

		state.result = message.member.displayName + " has used bandages.";
	}
	else{

		state.result = "You are not bleeding at this moment.";
	}
}

exports.immediate.eyedrops = function(message, character, state, eventId, event, amount){

	if(character.postresults.includes('blind')){

		var index = character.items.indexOf(eventId);
		character.items.splice(index, 1);
		index = character.postresults.indexOf('blind');
		character.postresults.splice(index, 1);
		var _id = character._id + 'blind';
		var active = {
			"_id": _id
		}
		dbfunc.removeActive(active);

		character.sklEq += 30;
		charfunc.calculateStats(character);

		state.result = message.member.displayName + " has used eyedrops.";
	}
	else{

		state.result = "You are not blind at this moment.";
	}
}

exports.immediate.scissors = function(message, character, state, eventId, event, amount){

	if(character.postresults.includes('root')){

		var index = character.items.indexOf(eventId);
		character.items.splice(index, 1);
		index = character.postresults.indexOf('root');
		character.postresults.splice(index, 1);
		var _id = character._id + 'root';
		var active = {
			"_id": _id
		}
		dbfunc.removeActive(active);

		character.spdEq += 10;
		charfunc.calculateStats(character);

		state.result = message.member.displayName + " has used scissors.";
	}
	else{

		state.result = "You are not rooted at this moment.";
	}
}

exports.immediate.shock_tablet = function(message, character, state, eventId, event, amount){

	if(character.postresults.includes('paralyze')){

		state.save = false;
		dbfunc.getDB().collection("actives").find({"character": character._id}).toArray(function(err, actives){

			var index = character.items.indexOf(eventId);
			character.items.splice(index, 1);
			index = character.postresults.indexOf('paralyze');
			character.postresults.splice(index, 1);
			var _id = character._id + 'paralyze';
			var active = {
				"_id": _id
			}
			for(var i = 0; i < actives.length; i++){

				if(actives[i].id == 'paralyze'){

					character.resEq += actives[i].value;
					break;
				}
			}
			charfunc.calculateStats(character);
			dbfunc.updateCharacter(character);

			state.result = message.member.displayName + " has used a shock tablet.";
			dbfunc.removeActive(active);
		});
	}
	else{

		state.result = "You are not paralyzed at this moment.";
	}
}

exports.immediate.growth_pill = function(message, character, state, eventId, event, amount){

	state.save = false;
	dbfunc.getDB().collection("actives").find({"character": character._id}).toArray(function(err, actives){

		var index = character.items.indexOf(eventId);
		character.items.splice(index, 1);
		var active;
		for(var i = 0; i < actives.length; i++){

			if(actives[i].id == eventId){

				var active = actives[i];
				break;
			}
		}
		if(active != null){

			//Update active
			active.duration += activesList[eventId].duration;
			if(active.duration > 10) active.duration = 10;
			dbfunc.updateActive(active);
		}
		else{

			//Create new active
			active = activesList[eventId];
			character.hpEq += 20;
			dbfunc.pushToState(character, eventId, active, active.battleStates, 1);
		}
		charfunc.calculateStats(character);
		dbfunc.updateCharacter(character);

		state.result = message.member.displayName + " has used a growth pill.";
	});
}

exports.immediate.master_grumbos_blessing = function(message, character, state, eventId, event, amount){

	var index = character.items.indexOf(eventId);
	character.items.splice(index, 1);
	var randomArray = ['hp', 'pow', 'wis', 'skl', 'def', 'res', 'spd', 'luk', 'hp'];
	var random = Math.floor(Math.random() * (randomArray.length - 1));
	var stat = randomArray[random];
	var statMod = stat + "Mod";
	character[statMod] += 1;
	charfunc.calculateStats(character);
	state.result = "Master Grumbo's Blessing gave you a permanent +1 boost to " + stat.toUpperCase() + "!";
}

exports.immediate.chauder_powder = function(message, character, state, eventId, event, amount){

	var index = character.items.indexOf(eventId);
	character.items.splice(index, 1);
	var random = Math.random() * 100;
	if(random < 30){

		if(random < 10){

			character.wisMod -= 1;
			state.result = "Chauder Powder made you dumber!";
		}
		else{

			character.wisMod += 1;
			state.result = "Chauder Powder made you smarter!";
		}
	}
	else{

		state.result = "Chauder Powder did absolutely nothing!";
	}
	charfunc.calculateStats(character);
}

exports.immediate.feather_stone = function(message, character, state, eventId, event, amount){

	if(character.postresults.includes('petrify')){

		var index = character.items.indexOf(eventId);
		character.items.splice(index, 1);
		index = character.postresults.indexOf('petrify');
		character.postresults.splice(index, 1);
		var _id = character._id + 'petrify';
		var active = {
			"_id": _id
		}
		dbfunc.removeActive(active);

		character.defEq -= 50;
		character.powEq += 100;
		charfunc.calculateStats(character);

		state.result = message.member.displayName + " has used a feather stone.";
	}
	else{

		state.result = "You are not petrified at this moment.";
	}
}

exports.immediate.class_ticket = function(message, character, state, eventId, event, amount){

		var index = character.items.indexOf(eventId);
		character.items.splice(index, 1);
		character.classTime = 0;
		state.result = message.member.displayName + " has used a class ticket!";
}

exports.immediate.boss_ticket = function(message, character, state, eventId, event, amount){

		var index = character.items.indexOf(eventId);
		character.items.splice(index, 1);
		character.bosstime = 0;
		state.result = message.member.displayName + " has used a boss ticket!";
}

//////////////////////////
// NONCONSUME FUNCTIONS //
//////////////////////////






/**
* Adds battle attempts to character if possible.
*/
exports.restockBattles = function(currentTime, character){

	var timeSinceLastBattle = currentTime - character.battletime;
	var addBattles = Math.floor(timeSinceLastBattle/charfunc.calculateWaitTime(character));
	if(addBattles > 0){

		character.battlesLeft += addBattles;
		if(character.battlesLeft < 5){

			character.battletime = character.battletime + (addBattles * charfunc.calculateWaitTime(character));
		}
		if(character.battlesLeft >= 5){

			character.battlesLeft = 5;
		}
	}

	dbfunc.updateCharacter(character);
}
