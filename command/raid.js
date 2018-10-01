//Initialize DB functions
let dbfunc = require('../data/db.js');

//Initialize fs
const fs = require("fs");

//Initialize functions
//TODO let state = require('../state/state_raid.js');
let statefunc = require('../state/state.js');
let charfunc = require('../character/character.js');
let classfunc = require('../character/class.js');

//Initialize list files
let raidList = JSON.parse(fs.readFileSync("./values/raids.json", "utf8"));
let classList = JSON.parse(fs.readFileSync("./values/classes.json", "utf8"));
let activeList = JSON.parse(fs.readFileSync("./values/actives.json", "utf8"));
let itemList = JSON.parse(fs.readFileSync("./values/items.json", "utf8"));
let equipList = JSON.parse(fs.readFileSync("./values/equips.json", "utf8"));

const RAID_WAIT_TIME = 1; //6 hours
const RAID_MAX_MEMBERS = 4;
const RAID_BASE_PER_TURN = 90;
const RAID_TURN_VALUE = 500;

exports.RAID_WAIT_TIME = RAID_WAIT_TIME;
exports.RAID_MAX_MEMBERS = RAID_MAX_MEMBERS;

let raids = {}

/**
* Raid command
*/
exports.commandRaid = function(message, args, character){

  //Determine how many battles they should have left
  var date = new Date();
  var currentTime = date.getTime();
  exports.restockBattles(currentTime, character);
  var timeSinceLastRaid = currentTime - character.raidtime;

  //RAID INFO
  if(args[2] == 'info' && (args.length == 4 || (args.length == 5 && args[4] == '-d'))){

    //DM user
		var sender = message.author;
		if(args.length == 5){

			//Message channel
			sender = message.channel;
		}

    var raid = raidList[args[3]];
    if(raid != null){

      var raidString = raid.name + "  |  Lv Req: " + raid.level + "  |  Command: " + raid.id + "\n"
        + "HP " + raid.hp + "  |  POW " + raid.powBase + "  |  WIS " + raid.wisBase + "  |  SKL " + raid.sklBase + "  |  SPD " + raid.spdBase + "\n"
        + "Base Turn Victory Chance: " + raid.base_chance + "%\n"
        + raid.description + "\n"
        + "Actives: ";
      for(var i = 0; i < raid.actives.length; i++){

        var activeName = activeList[raid.actives[i]].name;
        raidString += activeName;
        if(i == raid.actives.length - 1){

          raidString += "\n";
        }
        else{

          raidString += ", ";
        }
      }
      raidString += "Loot: ";
      for(var j = 0; j < raid.loot.length; j++){

        if(raid.loot[j] != ""){

          var lootedItem = itemList[raid.loot[j]];
          if(lootedItem == null) lootedItem = equipList[raid.loot[j]];
          raidString += lootedItem.name;
          if(j == raid.loot.length - 1){

            raidString += "\n";
          }
          else{

            raidString += ", ";
          }
        }
      }
      raidString += "Gold: " + raid.gold;
      sender.send(raidString);
    }
    else{

      sender.send(args[3] + " is not a valid raid command.");
    }
  }

  //AVAILABLE RAIDS
  else if(args.length == 2 || (args.length == 3 && args[2] == '-d')){

    //DM user
		var sender = message.author;
		if(args.length == 3){

			//Message channel
			sender = message.channel;
		}

    var raidsString = "Raid List\n\n";
    for(var key in raidList){

      var raid = raidList[key];
      raidsString += raid.name + "  |  Lv Req: " + raid.level + "  |  Command: " + raid.id + "\n";
    };
    sender.send(raidsString);
  }

  //ASSEMBLE
  else if(args[2] == 'assemble' && args.length == 3){

    //Not enough battles left
    if(character.battlesLeft < 1){

      message.channel.send("You need at least 1 battle stock to raid.");
    }
    else if(character.hp <= 0){

      message.channel.send("You need to have more than 0 HP to assemble a raid!");
    }
    //Raided too recently
    else if(timeSinceLastRaid/RAID_WAIT_TIME < 1){

      var hours = Math.floor((RAID_WAIT_TIME - timeSinceLastRaid)/3600000);
      var minutes = Math.ceil(((RAID_WAIT_TIME - timeSinceLastRaid) % 3600000) / 60000);
      message.channel.send("You've raided too recently " + message.member.displayName + "!"
        + "\nYou can raid again in " + hours + " hours " + minutes + " minutes");
    }
    else{

      //Assemble raid group if not in battle/raid
      if(!character.battleLock){

        character.battleLock = true;
        raids[character._id] = [character._id];
        dbfunc.updateCharacter(character);
        message.channel.send(message.member.displayName + " has begun assembling members for a raid!");
      }
      else{

        message.channel.send("You are currently locked " + message.member.displayName + "!");
      }
    }
  }

  //CANCEL
  else if(args[2] == 'cancel' && args.length == 3){

    //Remove yourself from raid group. If you are the raid leader, the next person becomes the leader of the raid group
    if(!character.raidLock && character.battleLock){

      //Not part of a raid, but in battle
      if(raids[character._id] == null){

        message.channel.send("You are not part of a raid " + message.member.displayName + "!");
      }
      //You're not included in your raid array means you're not the leader
      else if(!raids[character._id].includes(character._id)){

        var raidLead = raids[character._id][0];
        raids[raidLead].splice(raids[raidLead].indexOf(character._id), 1);
        message.channel.send(message.member.displayName + " has left the raid.");
      }
      //Raid leader leaves, pass to next person if possible
      else{

        raids[character._id].splice(raids[character._id].indexOf(character._id), 1);
        var cancelString = message.member.displayName + " has left the raid. ";
        if(raids[character._id].length > 0){

          raids[raids[character._id][0]] = raids[character._id];
          var newLeadId = raids[character._id][0];
          cancelString += message.guild.members.get(newLeadId).displayName + " is the new raid leader!";
        }
        message.channel.send(cancelString);
      }
      raids[character._id] = null;
      character.battleLock = false;
      dbfunc.updateCharacter(character);
    }
    else if(!character.battleLock){

      message.channel.send("You are not part of a raid " + message.member.displayName + "!");
    }
    else{

      message.channel.send("You cannot cancel a raid in progress " + message.member.displayName + "!");
    }
  }

  //JOIN
  else if(args[2] == 'join' && args.length == 4){

    var leader = message.mentions.members.first();
    if(leader != null){

      //Get lead character
    	dbfunc.getDB().collection("characters").findOne({"_id": leader.id}, function(err, leadCharacter){

        if(leadCharacter != null){

          //They've begun their raid
          if(leadCharacter.raidLock){

            message.channel.send(message.guild.members.get(leader.id).displayName + " has already begun their raid!");
          }
          //Trying to join a raid group thats not started
          else if(raids[leader.id] == null){

            message.channel.send(message.guild.members.get(leader.id).displayName + " is not hosting a raid.");
          }
          //Trying to join a raid group that has maximum members
          else if(raids[leader.id].length >= RAID_MAX_MEMBERS){

            message.channel.send(message.guild.members.get(leader.id).displayName + "'s raid group has the max amount of raid members!");
          }
          else if(character.hp <= 0){

      			message.channel.send("You need to have more than 0 HP to join a raid!");
      		}
          //Not enough battles left
          else if(character.battlesLeft < 1){

            message.channel.send("You need at least 1 battle stock to raid.");
          }
          //Raided too recently
          else if(timeSinceLastRaid/RAID_WAIT_TIME < 1){

            var hours = Math.floor((RAID_WAIT_TIME - timeSinceLastRaid)/3600000);
            var minutes = Math.ceil(((RAID_WAIT_TIME - timeSinceLastRaid) % 3600000) / 60000);
            message.channel.send("You've raided too recently " + message.member.displayName + "!"
              + "\nYou can raid again in " + hours + " hours " + minutes + " minutes");
          }
          else{

            //Assemble raid group if not in battle/raid
            if(!character.battleLock){

              character.battleLock = true;
              raids[character._id] = [leader.id];
              raids[leader.id].push(character._id);
              dbfunc.updateCharacter(character);
              message.channel.send(message.member.displayName + " has joined " + message.guild.members.get(leader.id).displayName + "'s raid group!");
            }
            else{

              message.channel.send("You are currently locked " + message.member.displayName + "!");
            }
          }
        }
      });
    }
  }

  //DO ACTUAL RAID
  else if(args.length == 3){

    var raidId = args[2];

    //If raid exists
    if(raidList[raidId] != null){

      var raid = raidList[raidId];

      //Reset bosses
      raidList = JSON.parse(fs.readFileSync("./values/raids.json", "utf8"));

  		//Character is already in a raid
      if(character.raidLock){

        message.channel.send("You are currently locked " + message.member.displayName + "!");
      }
      //Character is not in a raid group
      else if(raids[character.id] == null){

        message.channel.send("You are not in a raid group " + message.member.displayName + "!");
      }
      //Character is not the raid host
  		else if(!raids[character.id].includes(character.id)){

  			message.channel.send("You are not the raid host " + message.member.displayName + "!");
  		}
      //RAID
  		else{

        var characterIds = raids[character.id];
        var characters = [];
        for(var x = 0; x < characterIds.length; x++){

          dbfunc.getDB().collection("characters").findOne({"_id": characterIds[x]}, function(err, raidCharacter){

            characters.push(raidCharacter);
            if(characters.length == characterIds.length){

              checkRaidReqs(message, args, characters, raid);
            }
          }
        }
  		}
    }
    else{

      message.channel.send(raidId + " is not a correct raid command.");
    }
  }

  //BAD COMMAND
  else{

		message.channel.send("Bad raid command. Try '!grumbo help' for the correct command.");
	}
}

/**
* Check requirements for raid boss, and do the raid boss if requirements met.
*/
function checkRaidReqs(message, args, characters, raidBoss){

  boolean canRaid = true;
  for(var x = 0; x < characters.length; x++){

    var character = characters[x];
    if(character.level < raidBoss.level){

      canRaid = false;
      break;
    }
  }

  if(canRaid){

    var activesMap = {};
    var mapCount = 0;
    for(var y = 0; y < characters.length; y++){

      //Get all character active effects
      var character = characters[y];
      dbfunc.getDB().collection("actives").find({"character": character._id}).toArray(function(err, actives){

        activesMap[character._id] = actives;
        mapCount++;
        if(mapCount == characters.length){

          raidLockCharacters(message, args, characters, activesMap, raidBoss);
        }
      });
    }
  }
  else{

    message.channel.send("A member of your raid group is not a high enough level for this raid!");
  }
}

/**
* Raid lock all the characters.
*/
function raidLockCharacters(message, args, characters, activesMap, raidBoss){

	character.raidLock = true;
  var charCount = 0;
  for(var x = 0; x < characters.length; x++){

    var character = characters[x];
	  dbfunc.getDB().collection("characters").updateOne({"_id": character._id}, {$set: {"raidLock": character.raidLock}}, function(error, result){

      charCount++;
      var date = new Date();
      var currentTime = date.getTime();
      character.raidtime = currentTime;
      if(character.battlesLeft == 5){

        character.battletime = currentTime;
      }
      character.battlesLeft -= 1;
      if(charCount == characters.length){

        doRaid(message, args, characters, activesMap, raidBoss);
      }
    });
  }
}

/**
* Do the raid.
*/
function doRaid(message, args, characters, activesMap, boss){

  //Initialize boss stats
  boss.pow = boss.powBase;
  boss.wis = boss.wisBase;
  boss.skl = boss.sklBase;
  boss.spd = boss.spdBase;

  //Prebattle determinations
  var battleState = {};
  battleState.state = statefunc.RAID;
  battleState.phase = 0; //Increments only when a boss acts
  battleState.turn = 0; //Increments when either a character or boss acts

  var turnValueMap = {};
  var turnIds[];
  var turnIndex = 0;
  var beginRaidString = "";
  for(var x = 0; x < characters.length; x++){

    var character = characters[x];
    turnValueMap[character.id] = 0;
    turnIds.push(character.id);
    beginRaidString += message.guild.members.get(character.id).displayName;
    if(x != characters.length - 1) beginRaidString += ",";
    beginRaidString += " ";
  }
  //Init boss turn values
  turnValueMap[statefunc.RAID] = 0;
  turnIds.push(statefunc.RAID);
  beginRaidString += " have begun a raid against " + boss.name + "!";

  recursiveRaidTurn(battleState, message, args, characters, activesMap, boss, turnValueMap, turnIds, turnIndex);
}

/**
* Determines what to do in the next turn.
*/
function recursiveRaidTurn(battleState, message, args, characters, activesMap, boss, turnValueMap, turnIds, turnIndex){

  var alive = false;
  for(var x = 0; x < characters.length; x++){

    var character = characters[x];
    if(character.hp > 0){

      alive = true;
      break;
    }
  }
  if(alive){

    if(boss.hp > 0){

      var grumbo;
      var turnId;
      while(true){

        turnId = turnIds[turnIndex]];
        //Get character or boss to get their SPD
        if(turnId != statefunc.RAID){

          for(var x = 0; x < characters.length; x++){

            grumbo = characters[x];
            if(turnIds[turnIndex] == grumbo.id) break;
          }
        }
        else{

          grumbo = boss;
        }

        turnValueMap[turnId] += RAID_BASE_PER_TURN + grumbo.spd;
        if(turnValueMap[turnId] < RAID_TURN_VALUE){

          turnIndex += 1;
          if(turnIndex >= turnIds.length) turnIndex = 0;
        }
        else{

          turnValueMap[turnId] -= RAID_TURN_VALUE;
          turnIndex += 1;
          if(turnIndex >= turnIds.length) turnIndex = 0;
          break;
        }
      }

      battleState.turn += 1;
      if(turnId != statefunc.RAID){

        //TODO grumbo is a character, do a character turn
        message.channel.send("This is a character turn!");
        battleState.raidWin = true;
        finishRaid(battleState, message, args, characters, activesMap, boss);
      }
      else{

        battleState.phase += 1;
        //TODO grumbo is a raid boss, do a raid boss turn
        message.channel.send("This is a boss turn!");
        battleState.raidWin = false;
        finishRaid(battleState, message, args, characters, activesMap, boss);
      }
    }
    else{

      battleState.raidWin = true;
      finishRaid(battleState, message, args, characters, activesMap, boss);
    }
  }
  else{

    battleState.raidWin = false;
    finishRaid(battleState, message, args, characters, activesMap, boss);
  }
}

/**
* Finish the raid.
*/
function finishRaid(battleState, message, args, characters, activesMap, boss){

  var finishString = "";
  //WIN
  if(battleState.raidWin){

    finishString += boss.victory;
  }
  //LOSE
  else{

    finishString += boss.loss;
  }
  for(var i = 0; i < characters.length; i++){

    character.battleLock = false;
    character.raidLock = false;
    raids[character.id] = null;

    //TODO FIGURE OUT HOW TO AND WHETHER TO GIVE REWARDS
    if(battleState.raidWin){


    }
    else{


    }

    character.items.sort();
    character.equips.sort();

    //Save battle results
    dbfunc.updateCharacter(character);
  }

  message.channel.send(finishString);
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
