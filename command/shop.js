//Initialize fs
const fs = require("fs");

//Initialize list of items file
let itemList = JSON.parse(fs.readFileSync("./values/items.json", "utf8"));

//Initialize state for state constants and functions
let state = require('../state.js');

//TODO create shop object

exports.commandShop = function(levels, message, args, character){
	
	//Display shop
	if(args.length == 2 || (args.length == 3 && args[2] == 'display')){
		
		//DM user
		var sender = message.author;
		if(args.length == 3){
			
			//Message channel
			sender = message.channel;
		}
		
		//TODO update shop
		
		//TODO display shop
	}
	
	//Buy an item
	else if(args[2] == 'buy' && (args.length == 4 || (args.length == 5 && isInteger(args[4])))){
		
		var buyItem = args[3];
		var amount = 1;
		if(args.length == 5) amount = args[4];
		//TODO buy 1 or multiple
	}
	
	//Sell an item
	else if(args[2] == 'sell' && (args.length == 4 || (args.length == 5 && isInteger(args[4])))){
		
		var sellItem = args[3];
		var amount = 1;
		var hasEnough = character.items.includes(item);
		if(args.length == 5 && hasEnough){ 
		
			amount = args[4];
			//Count how much the user has of that particular item
			var count = 0;
			for(var i = 0; i < character.items.length; ++i){
				
				if(items[i] == item) count++;
			}
			if(amount > count) hasEnough = false;
		}
		
		if(hasEnough){
			
			var totalGold = 0;
			var details = itemList[sellItem];
			var sellGold = details.value;
			
			//Sell given amount of item
			for(int i = 0; i < amount; i++){
				
				totalGold += sellGold;
				var index = character.items.indexOf(sellItem);
				character.items.splice(index, 1);
			}
			character.gold += totalGold;
			
			message.channel.send(message.member.displayName + " sold " + details.name + " x" + amount + " for " + totalGold + " gold!");
			
			//Save character
			fs.writeFile("./levels.json", JSON.stringify(levels, null, 4), (err) => {
				
				if (err) console.error(err)
			});
		}
		else{
			
			message.channel.send("You do not have enough of the item: " + sellItem);
		}
	}
	
	//Bad command
	else{
		
		message.channel.send("Bad shop command. Try '!grumbo help' for the correct command.");
	}
}