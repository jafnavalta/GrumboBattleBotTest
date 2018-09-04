//Initialize list of items, effects, etc.
const fs = require("fs");
let itemList = JSON.parse(fs.readFileSync("./values/items.json", "utf8"));

/**
* Display list of current active effects.
*/
exports.commandActive = function(character, message, args){
	
	if(args.length == 2 || (args.length == 3 && args[2] == 'display')){
	
		//DM user
		var sender = message.author;
		if(args.length == 3){
			
			//Message channel
			sender = message.channel;
		}
		
		var noActives = true;
		for(var id in character.active){
			
			if(character.active.hasOwnProperty(id)){
				
				noActives = false;
				break;
			}
		}
		
		if(noActives){
			
			sender.send("You have no active effects " + message.member.displayName + "!");
		}
		else{
			
			var activeString = message.member.displayName + "'s active effects\n\n";
			var actives = character.active;
			for(var id in actives){
				
				if(character.active.hasOwnProperty(id)){
					
					var activeObj = actives[id];
					activeString += activeObj.name;
					if(activeObj.duration != null){
						
						activeString += "  |  " + activeObj.duration + " battle(s)";
					}
					activeString += "\n";
				}
			
			sender.send(activeString);
		}
	}
	else{
		
		message.channel.send("Bad active command. Try '!grumbo help' for the correct command.");
	}
}