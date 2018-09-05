//Initialize Discord Bot
var Discord = require('discord.js');
var auth = require('./auth.json');
const client = new Discord.Client();

//Initialize DB functions
let dbfunc = require('./data/db.js');

//Initialize game functions
let state = require('./state.js');
let battlefunc = require('./command/battle.js');
let challengefunc = require('./command/challenge.js');
let itemsfunc = require('./command/items.js');
let shopfunc = require('./command/shop.js');
let activefunc = require('./command/active.js');

let requestTimes = {}; //Store character request times so they can't request more than once every 1 second

client.on("ready", () => {
	
	// This event will run if the bot starts, and logs in, successfully.
	console.log(`Bot has begun battle, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 

	// What the bot is playing
	client.user.setActivity(`Battling ${client.users.size} dudes in ${client.guilds.size} servers`);

	//Could be long, should do on startup
	shopfunc.initWeighedArrays();
	battlefunc.initWeighedArrays();
	
	//TODO do same as above for different type of Grumbos
	
	dbfunc.connectToServer(function(error){
		
		listen();
	});
});

/**
* Listen for commands.
*/
function listen(){

	client.on("message", async message => {
		
		// Ignore self
		if(message.author.bot) return;
		
		// Our bot needs to know if it will execute a command
		// It will listen for messages that will start with `!grumbo`
		if(message.content.substring(0, 9) == '!grumtest'){
			
			var lastRequest = requestTimes[message.author.id];
			var currentTime = new Date().getTime();
			if(lastRequest == null || (lastRequest != null && lastRequest + 750 < currentTime)){
			
				requestTimes[message.author.id] = currentTime;
				dbfunc.getDB().collection("characters").findOne({"_id": message.author.id}, function(err, character){
					
					//If character doesn't exist
					if(character == null){
						
						dbfunc.createNewCharacter(message, function(error){
			
							parseCommand(message);
						});
					}
					else{
						
						parseCommand(message);
					}
				});
			}
			else{
				
				//Don't allow requests from same person too quickly (1 every 0.75 seconds)
				return;
			}
		 }
		 else{
			 
			 //Ignore all other messages that don't begin with the !grumbo prefix
			 return;
		 }
	});
}

/**
* Parses command.
*/
function parseCommand(message){
	
	//Get character
	dbfunc.getDB().collection("characters").findOne({"_id": message.author.id}, function(err, character){
		
		var args = message.content.split(' ');
	
		/////////////////////
		// !! HELP MENU !! //
		/////////////////////
		if(args[1] == 'help' && args.length == 2){
			
			message.channel.send("Try your chance in battle with me, gain experience, level up, and be the strongest on the server :^ )\n\n"
				+ "GRUMBO HELP: COMMANDS\n"
				+ "!grumbo battle level <number>  |  Battle a level <number> Grumbo. The higher the level compared to yours, the lower the chance of winning (but higher chance of more experience!)\n"
				+ "!grumbo challenge @mention <number> exp/gold  |  Challenge another user by mentionning them with @ and putting <number> experience/gold on the line!\n"
				+ "!grumbo challenge accept <number> exp/gold  |  If you've been challenged, you can accept it with this command. <number> must match the challenger's wager.\n"
				+ "!grumbo stats  |  See your grumbo stats (Level, exp, gold, wins, losses, win rate) and how many battles/challenges you have left\n"
				+ "!grumbo leaderboards  |  See the stats of everyone on the server who has interacted with GrumboBattleBot, sorted by level\n"
				+ "!grumbo patchnotes  |  Show the recent patch notes\n"
				+ "!grumbo guide  |  Show guide about game mechanics like battles, experience and gold scaling, etc.\n"
				+ "!grumbo help  |  Show this help menu"); 
		}
		
		///////////////////////
		// !! PATCH NOTES !! //
		///////////////////////
		else if(args[1] == 'patchnotes' && args.length == 2){
			
			message.channel.send("GRUMBO PATCH NOTES\n\n"
			
				+ "- Users can now battle at the same time. Challenges are still one at a time.\n"
				+ "- Stats and leaderboards are now private messages.\n"
				+ "- Added gold challenges. Item shop is probably next on the roadmap.\n"
				+ "- Changed challenge commands to accomodate gold challenges.\n\n"
			
				+ "OLDER NOTES\n"
				+ "- Added gold. Gold challenges to be added in next update. Item shop probably follows that.\n"
				+ "- Maximum victory chance changed from 99% to 95%\n"
				+ "- Added guide command for further help.\n"
				+ "- Decreased exp gained in won battles by your current level.\n"
				+ "- Added PvP with the challenge command. Wager experience.\n"
				+ "- Changed xp scaling for higher level Grumbos\n"
				+ "- Minimum victory chance changed from 10% to 5%");
		}
		
		/////////////////
		// !! GUIDE !! //
		/////////////////
		else if(args[1] == 'guide' && args.length == 2){
			
			message.channel.send("GRUMBO BATTLE BOT GUIDE\n\n"
			
				+ "BATTLES\n"
				+ "You can battle any Grumbo whose level is up to 20 levels higher than you. The experience, gold and chance of victory are based on the level difference between "
				+ "your current level and the Grumbo level. As the level of the Grumbo increases, experience increases, but gold and chance of victory decrease. The min victory "
				+ "chance is 5% and the max is 95%. Experience is also decreased independently based on how high your level is. While you get more gold the lower the level of the Grumbo, " 
				+ "you will only get 10 gold if you fight a Grumbo who is over 20 levels lower than you.\n"
				+ "Battle attempts recover 1 stock every hour up to a maximum of 3.\n\n"
				
				+ "CHALLENGES\n"
				+ "Challenge users to a wager.\n"
				+ "Exp challenge: The loser will always lose the wager they bet, but the winner will win a wager based on the chance of victory. This can be less than what was wagered but can also be more.\n"
				+ "Gold challenge: The chance of winning is always a 50/50. You always win/lose exactly what was bet.\n"
				+ "Challenge attempts recover 1 stock every hour up to a maximum of 3.");
		}
		
		/////////////////
		// !! STATS !! //
		/////////////////
		else if(args[1] == 'stats'){
			
			displayStats(character, message, args);
		}
		
		////////////////////////
		// !! LEADERBOARDS !! //
		////////////////////////
		else if(args[1] == 'leaderboards'){
			
			displayLeaderboards(message, args);
		}
		
		//////////////////////////
		// !! ACTIVE EFFECTS !! // 
		//////////////////////////
		else if(args[1] == 'active'){
			
			activefunc.commandActive(character, message, args);
		}
		
		/////////////////
		// !! ITEMS !! //
		/////////////////
		else if(args[1] == 'items'){
			
			itemsfunc.commandItems(message, args, character);
		}
		
		/////////////////
		// !! ITEMS !! //
		/////////////////
		else if(args[1] == 'shop'){
			
			shopfunc.commandShop(message, args, character);
		}
		
		//////////////////
		// !! BATTLE !! //
		//////////////////
		else if(args[1] == 'battle'){
			
			battlefunc.commandBattle(message, args, character);
		}
		
		/////////////////////
		// !! CHALLENGE !! //
		/////////////////////
		else if(args.length == 5 && args[1] == 'challenge'){
			
			challengefunc.commandChallenge(message, args, character);
		}
		
		// Bad command
		else{
			
			message.channel.send('Invalid Grumbo command. Type !grumbo help to see a list of commands.');
		}
	 });
}

/**
* Display stats. Also calculate how many battles you currently have.
*/
function displayStats(character, message, args){
	
	if(args.length == 2 || (args.length == 3 && args[2] == 'display')){
		
		//DM user
		var sender = message.author;
		if(args.length == 3){
			
			//Message channel
			sender = message.channel;
		}
		
		//Determine how many battles they should have left
		var date = new Date();
		var currentTime = date.getTime();
		battlefunc.restockBattles(currentTime, character);
		
		//Determine how many challenges they should have left
		challengefunc.restockChallenges(currentTime, character);
		
		var username = message.member.displayName;
		var statsString = username + " Lv" + character.level + " with " + character.experience + " EXP  |  " + character.gold + " Gold"
						+ "\nBattle          Wins " + character.wins + "  |  Losses " + character.losses + "  |  Win% " + character.winrate
						+ "\nChallenge  Wins " + character.challengeWins + "  |  Losses " + character.challengeLosses + "  |  Win% " + character.challengeWinrate
						+ "\nYou have " + character.battlesLeft + "/3 battles left"
						+ "\nYou have " + character.challengesLeft + "/3 challenges left";
		if(character.battlesLeft < 3){
			
			var timeUntilNextBattleInMinutes = Math.ceil((character.battletime + 3600000 - currentTime)/60000);
			statsString = statsString + "\nYou will gain another battle chance in " + timeUntilNextBattleInMinutes + " minutes";
		}
		if(character.challengesLeft < 3){
			
			var timeUntilNextChallengeInMinutes = Math.ceil((character.challengetime + 3600000 - currentTime)/60000);
			statsString = statsString + "\nYou will gain another challenge in " + timeUntilNextChallengeInMinutes + " minutes";
		}
		sender.send(statsString);

		//Save battle results
		dbfunc.updateCharacter(character);
	}
	else{
		
		message.channel.send("Bad stats command. Try '!grumbo help' for the correct command.");
	}
}

/**
* Display leaderboards. Sorts by level, then by experience.
*/
function displayLeaderboards(message, args){
	
	if(args.length == 2 || (args.length == 3 && args[2] == 'display')){
	
		dbfunc.getDB().collection("characters").find().toArray(function(err, characters){
					
			//DM user
			var sender = message.author;
			if(args.length == 3){
				
				//Message channel
				sender = message.channel;
			}
			
			//Sort based on level first, then experience
			characters.sort(function(a, b){
				var keyA = a.level,
					keyB = b.level,
					xpA = a.experience,
					xpB = b.experience;
					
				//Compare the users
				if(keyA < keyB) return 1;
				if(keyA > keyB) return -1;
				if(xpA < xpB) return 1;
				if(xpA > xpB) return -1;
				return 0;
			});
			
			var leaderboards = "------LEADERBOARDS------\n\n"
			var count = 1;
			characters.forEach(function(sortedCharacter){
				
				//Only show people in the server
				if(message.guild.members.get(sortedCharacter._id) != undefined){
					
					leaderboards = leaderboards + "[" + count + "] " + message.guild.members.get(sortedCharacter._id).displayName + "   Lv" + sortedCharacter.level + "  |  " 
						+ sortedCharacter.experience + " EXP  |  " + sortedCharacter.gold + " Gold"
						+ "\n      Battle          Wins " + sortedCharacter.wins + "  |  Losses " + sortedCharacter.losses + "  |  Win% " + sortedCharacter.winrate
						+ "\n      Challenge  Wins " + sortedCharacter.challengeWins + "  |  Losses " + sortedCharacter.challengeLosses + "  |  Win% " + sortedCharacter.challengeWinrate + "\n";
					count += 1;
				}
			});
			leaderboards = leaderboards + "\n--------------------------------"
			sender.send(leaderboards);
		});
	}
	else{
		
		message.channel.send("Bad leaderboards command. Try '!grumbo help' for the correct command.");
	}
}

/**
* Determines if x is an integer.
*/
function isInteger(x){
	
	return !isNaN(x) && (x % 1 === 0);
}

client.login(auth.token);