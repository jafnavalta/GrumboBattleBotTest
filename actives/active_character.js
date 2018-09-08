//Initialize DB functions
let dbfunc = require('../data/db.js');

//Initialize list of actives
const fs = require("fs");
let activesList = JSON.parse(fs.readFileSync("./values/actives.json", "utf8"));

//Initialize states
exports.prebattle = {};
exports.preresults = {};
exports.postresults = {};

///////////////////////////////////
// CHARACTER PREBATTLE FUNCTIONS //
///////////////////////////////////
exports.prebattle.poison = function(character, battleState, eventId, actives){

	battleState.chanceMod -= 5;
}

exports.prebattle.fear = function(character, battleState, eventId, actives){

	var fearResults = Math.random() * 100;
	if(fearResults < 10){

		battleState.chanceMod -= 100;
		battleState.preMessages.push("You were overcome with fear!");
	}
	dbfunc.reduceDuration(character, [character.prebattle], eventId, actives);
}

exports.prebattle.battle_potion = function(character, battleState, eventId, actives){

	if(battleState.levelDiffActual >= 0) battleState.chanceMod += 5;
	else if(battleState.levelDiffActual >= -5) battleState.chanceMod += 4;
	else if(battleState.levelDiffActual >= -10) battleState.chanceMod += 3;
	else if(battleState.levelDiffActual >= -15) battleState.chanceMod += 2;
	else battleState.chanceMod += 1;
	dbfunc.reduceDuration(character, [character.prebattle], eventId, actives);
}

exports.prebattle.charm_of_wumbo = function(character, battleState, eventId, actives){

	battleState.minMod += 15;
	dbfunc.reduceDuration(character, [character.prebattle], eventId, actives);
}

exports.prebattle.berserk_potion = function(character, battleState, eventId, actives){

	for(var i = 0; i < actives.length; i++){

		if(actives[i].id == eventId){

			battleState.chanceMod += actives[i].duration;
			battleState.chanceMod -= 5;
			break;
		}
	}
	dbfunc.reduceDuration(character, [character.prebattle], eventId, actives);
}

////////////////////////////////////
// CHARACTER PRERESULTS FUNCTIONS //
////////////////////////////////////

/////////////////////////////////////
// CHARACTER POSTRESULTS FUNCTIONS //
/////////////////////////////////////
exports.prebattle.poison = function(character, battleState, eventId, actives){

	battleState.hpLoss += 5;
	dbfunc.reduceDuration(character, [character.prebattle, character.postresults], eventId, actives);
}

exports.postresults.flimsy_rope = function(character, battleState, eventId, actives){

	var random = Math.random() * 100;
	if(random < 50){

		battleState.avoidPostResults = true;
		battleState.endMessages.push("Flimsy rope activated and let you avoid post battle effects!");
	}
	dbfunc.reduceDuration(character, [character.postresults], eventId, actives);
}
