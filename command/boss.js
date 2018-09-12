//Initialize DB functions
let dbfunc = require('../data/db.js');

//Initialize fs
const fs = require("fs");

//Initialize functions
let state = require('../state.js');
let charfunc = require('../character/character.js');
let classfunc = require('../character/class.js');

//Initialize list files
let bossList = JSON.parse(fs.readFileSync("./values/bosses.json", "utf8"));
let classList = JSON.parse(fs.readFileSync("./values/classes.json", "utf8"));


/**
* Battle command
*/
exports.commandBattle = function(message, args, character){

  if(args[2] == 'info' && (args.length == 4 || (args.length == 5 && args[4] == '-d'))){

    //TODO boss info
  }
  else if(args.length == 2 || (args.length == 3 && args[2] == '-d')){

    //TODO display all bosses
  }
	else if(args.length == 3){

    var bossId = args[2];

    //If boss exists
    if(bossList[bossId] != null){

      var boss = bossList[bossId];
      //Determine how many battles they should have left
  		var date = new Date();
  		var currentTime = date.getTime();
  		exports.restockBattles(currentTime, character);

  		//Character is already in a battle
  		if(character.battleLock){

  			message.channel.send("You are already in battle " + message.member.displayName + "!");
  		}
      else if(character.hp <= 0){

  			message.channel.send("You need to have more than 0 HP to fight a boss!");
  		}
  		//User must be at least the boss' level to fight him.
  		else if(character.level < boss.level){

  			message.channel.send("You need to be level " + boss.level + " to fight " + boss.name);
  		}
  		//2 or less battles left
  		else if(character.battlesLeft <= 2){

  			message.channel.send("You don't have enough battles left! You need at least 3 battle stocks to fight a boss!");
  		}
  		//BOSS
  		else{

  			//Get all character active effects
  			dbfunc.getDB().collection("actives").find({"character": character._id}).toArray(function(err, actives){

  				doBoss(message, args, character, currentTime, actives, boss);
  			});
  		}
    }
    else{

      message.channel.send(bossId + " is not a correct boss command.");
    }

	}
	else{

		message.channel.send("Bad boss command. Try '!grumbo help' for the correct command.");
	}
}

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

/**
* Do battle
*/
function doBoss(message, args, character, currentTime, actives, boss){

	//Don't allow user to battle multiple times at once
	character.battleLock = true;
	dbfunc.getDB().collection("characters").updateOne(
			{"_id": character._id},
			{$set: {"battleLock": character.battleLock}},
		function(error, result){

    //Initialize boss stats
    boss.pow = boss.powBase;
    boss.wis = boss.wisBase;

		//Prebattle determinations
		var battleState = {};
		battleState.isBoss = true;
    battleState.enemyLevel = args[3];
    battleState.phase = 0;

		if(character.battlesLeft == 5){

			character.battletime = currentTime;
		}

    //TODO preboss fight message!

    recursiveBossPhase(battleState, message, args, character, currentTime, actives, boss);
	});
}

/**
* Recursive function for fighting until someone's HP is 0.
*/
function recursiveBossPhase(battleState, message, args, character, currentTime, actives, boss){

  battleState.phase += 1;
  state.prebattle(message, args, character, battleState, actives, boss);

  var username = message.member.displayName;
  var preMessageString = battleState.phase; //TODO premessage string
  battleState.preMessages.forEach(function(preMessage){

    preMessageString += preMessage + "\n";
  });
  preMessageString += ""; //TODO %chance of victory for phase
  message.channel.send(preMessageString);

  console.log(battleState.chance);

  //Wait 4 seconds before determining/displaying phase results
  setTimeout(function(){

    //Determine phase results
    battleState.result = Math.floor(Math.random() * (101));

    //Preresults determinations
    state.preresults(message, character, battleState, actives, boss);

    //If victory
    var endMessageString = battleState.phase + " "; //TODO is empty to start
    if(battleState.win){

      //Postresults determinations
      state.postresults(message, character, battleState, actives, boss);

      endMessageString += ""; //TODO preresmessages phase win
      battleState.preResMessages.forEach(function(preResMessage){

        endMessageString += preResMessage + "\n";
      });
      if(battleState.hpLoss >= 0){

        endMessageString += ""; //TODO damage taken in phase win
      }
      else{

        endMessageString += ""; //TODO damage recovered in phase win
      }
      battleState.endMessages.forEach(function(endMessage){

        endMessageString += endMessage + "\n";
      });
    }
    //If loss
    else{

      //Postresults determinations
      state.postresults(message, character, battleState, actives, boss);

      endMessageString += ""; //TODO preresmessages phase loss
      battleState.preResMessages.forEach(function(preResMessage){

        endMessageString += preResMessage + "\n";
      });
      if(battleState.hpLoss >= 0){

        endMessageString += ""; //TODO damage taken in phase loss
      }
      else{

        endMessageString += ""; //TODO damage recovered in phass loss
      }
      battleState.endMessages.forEach(function(endMessage){

        endMessageString += endMessage + "\n";
      });
    }

    character.hp -= battleState.hpLoss;
    if(character.hp < 0) character.hp = 0;
    else if(character.hp > charfunc.MAX_HP) character.hp = charfunc.MAX_HP;
    boss.hp -= battleState.dmgMod;
    if(boss.hp < 0) boss.hp = 0;
    else if(boss.hp > boss.max_hp) boss.hp = boss.max_hp;

    endMessageString += character.hp + " " + boss.hp; //TODO end phase message
    message.channel.send(endMessageString);

    character.battleLock = false;

    //Save battle results
    dbfunc.updateCharacter(character);

    if(character.hp > 0 && boss.hp > 0){

      recursiveBossPhase(battleState, message, args, character, currentTime, actives, boss);
    }
    else{

      finishBoss(battleState, message, args, character, currentTime, actives, boss);
    }
  }, 5000);
}

/**
* Recursive function for fighting until someone's HP is 0.
*/
function finishBoss(battleState, message, args, character, currentTime, actives, boss){

  //TODO determine boss end results
  message.channel.send("Its over");
}

/**
* Calculate battle experience gained.
*/
exports.calculateBattleExp = function(character, levelDiff, battleState){

	var exp = 100;
	//Low level Grumbo
	if(levelDiff > 0){

		exp = calculateLowLevelExp(exp, levelDiff);
	}
	//High level Grumbo
	else if(levelDiff < 0){

		exp = calculateHighLevelExp(exp, levelDiff);
	}
	exp = exp + Math.floor(Math.random() * 10) - 5 - Math.ceil(character.level/1.5) + 1 + battleState.expMod;
	if(exp < 3){

		exp = 3;
	}
	return exp;
}

/**
* Calculate experience gain against a Grumbo who is a lower level than you.
*/
function calculateLowLevelExp(exp, levelDiff){

	exp = exp - Math.floor(levelDiff * Math.pow(1.057, levelDiff)) - (Math.floor(Math.random() * 10) + 3);
	if(levelDiff > 3){

		exp = exp - (Math.floor(Math.random() * 10) + 4);
	}
	if(levelDiff > 7){

		exp = exp - (Math.floor(Math.random() * 10) + 5);
	}
	if(levelDiff > 12){

		exp = exp - (Math.floor(Math.random() * 10) + 6);
	}
	if(levelDiff > 17){

		exp = exp - (Math.floor(Math.random() * 10) + 6);
	}
	return exp;
}

/**
* Calculate experience gain against a Grumbo who is a higher level than you.
*/
function calculateHighLevelExp(exp, levelDiff){

	exp = exp - Math.ceil(levelDiff * Math.pow(1.142, Math.abs(levelDiff))) + Math.floor(Math.random() * 25) + 5;
	if(levelDiff < -3){

		exp = exp + Math.floor(Math.random() * 20) + 10;
	}
	if(levelDiff < -7){

		exp = exp + Math.floor(Math.random() * 25) + 15;
	}
	if(levelDiff < -12){

		exp = exp + Math.floor(Math.random() * 35) + 20;
	}
	if(levelDiff < -16){

		exp = exp + Math.floor(Math.random() * 40) + 25;
	}
	if(levelDiff == -20){

		exp = exp + Math.floor(Math.random() * 45) + 30;
	}
	return exp;
}

/**
* Calculate battle gold gained.
*/
exports.calculateBattleGold = function(character, levelDiff){

	var gold = 135 + Math.floor(Math.random() * 50) + levelDiff;
	if(levelDiff > 20){

		//Only get 10 gold if you fight a Grumbo who is less than 20 levels under you
		gold = 10;
	}
	else if(levelDiff < 15 && levelDiff >= 10){

		gold = gold - (Math.random() * 25) - 10;
	}
	else if(levelDiff < 10 && levelDiff >= 5){

		gold = gold - (Math.random() * 35) - 25;
	}
	else if(levelDiff < 5 && levelDiff >= 0){

		gold = gold - (Math.random() * 45) - 60 - ((5 - levelDiff) * 2);
	}
	//Grumbo is higher level than you, lower gold amount significantly
	else if(levelDiff < 0){

		gold = gold - (Math.random() * 40) - 75 + (levelDiff * 1.5);
	}
	if(gold < 10){

		gold = 10;
	}
	return Math.ceil(gold);
}

/**
* Calculates the prebattle character mods.
*/
exports.calculateCharacterMods = function(message, args, character, battleState, actives, grumbo){

	exports.calculateHPMod(character, battleState);
	exports.calculatePOWMod(character, grumbo, battleState);
	exports.calculateWISMod(character, grumbo, battleState);
}

/**
* Calculates the hp chance mod.
*/
exports.calculateHPMod = function(character, battleState){

	if(character.hp >= charfunc.MAX_HP - 5){

		battleState.hpMod += 5;
	}
	else if(character.hp <= 0){

		battleState.hpMod -= 50;
	}
	else if(character.hp <= 5){

		battleState.hpMod -= 25;
	}
	else if(character.hp <= 20){

		battleState.hpMod -= 10;
	}
	else if(character.hp <= 45){

		battleState.hpMod -= 5;
	}
}

/**
* Calculates the pow chance mod. Max 10 before actives.
*/
exports.calculatePOWMod = function(character, grumbo, battleState){

	battleState.powMod += Math.ceil((character.pow - grumbo.pow)/4);
	if(battleState.powMod > 10)	battleState.powMod = 10;
}

/**
* Calculates the wis chance mod. Max 10 before actives.
*/
exports.calculateWISMod = function(character, grumbo, battleState){

	battleState.wisMod += Math.ceil((character.wis - grumbo.wis)/6);
	if(battleState.wisMod > 10) battleState.wisMod = 10;
}

/**
* Calculates HP Loss. Max 50 before actives.
*/
exports.calculateHPLoss = function(message, character, battleState, actives, grumbo){

	if(!battleState.win){

		var dmg = Math.floor((grumbo.pow - character.def)/2.2);
		if(dmg < 0) dmg = 0;
		battleState.hpLoss += dmg;
	}
}

/**
* Randomize Grumbo.
*/
function getRandomGrumbo(grumboLevel){

	var random = Math.floor(Math.random() * (weighedGrumbos.length - 1));
	var grumboId = weighedGrumbos[random];
	var grumbo = grumboList[grumboId];
	calculateGrumboStats(grumbo, grumboLevel);

	return grumbo;
}

/**
* Calculate Grumbo stats.
*/
function calculateGrumboStats(grumbo, grumboLevel){

	grumbo.pow = Math.ceil((grumbo.powBase + (grumboLevel*1)) * grumbo.powX) + Math.floor(Math.random() * 4) - 2;
	grumbo.wis = Math.ceil((grumbo.wisBase + (grumboLevel*1)) * grumbo.wisX) + Math.floor(Math.random() * 4) - 2;
}


/**
* Determines if x is an integer.
*/
function isInteger(x){

	return !isNaN(x) && (x % 1 === 0);
}
