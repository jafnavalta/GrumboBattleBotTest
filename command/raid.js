//Initialize DB functions
let dbfunc = require('../data/db.js');

//Initialize fs
const fs = require("fs");

//Initialize functions
let state = require('../state/state.js');
let charfunc = require('../character/character.js');
let classfunc = require('../character/class.js');

//Initialize list files
let bossList = JSON.parse(fs.readFileSync("./values/bosses.json", "utf8"));
let classList = JSON.parse(fs.readFileSync("./values/classes.json", "utf8"));
let activeList = JSON.parse(fs.readFileSync("./values/actives.json", "utf8"));
let itemList = JSON.parse(fs.readFileSync("./values/items.json", "utf8"));
let equipList = JSON.parse(fs.readFileSync("./values/equips.json", "utf8"));

const RAID_WAIT_TIME = 1; //6 hours
const RAID_MAX_MEMBERS = 4;

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

  //ASSEMBLE
  if(args[2] == 'assemble' && args.length == 3){

    //Not enough battles left
    if(character.battlesLeft < 1){

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

      //You're not included in your raid array means you're not the leader
      if(!raids[character._id].includes(character._id)){

        var raidLead = raids[character._id][0];
        raids[raidLead].splice(raids[raidLead].indexOf(character._id), 1);
        message.channel.send(message.member.displayName + " has left the raid.");
      }
      //Raid leader leaves, pass to next person if possible
      else{

        console.log(raids[character._id]);
        raids[character._id].splice(raids[character._id].indexOf(character._id), 1);
        var cancelString = message.member.displayName + " has left the raid. ";
        console.log(raids[character._id]);
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

  //BAD COMMAND
  else{

		message.channel.send("Bad raid command. Try '!grumbo help' for the correct command.");
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
