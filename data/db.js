//Initialize MongoDB
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const uri = 'mongodb://127.0.0.1:27017/grumbobattlebot';

//For old character file
const fs = require("fs");

var db;

module.exports = {
	
	//Connect to db server and set DB. Finish with callback.
	connectToServer: function(callback){
		
		MongoClient.connect(uri, { useNewUrlParser: true }, function(error, client){
	  
			assert.equal(null, error);
			db = client.db();
			
			if(fs.existsSync("./levels.json")){
			
				//If levels.json still exists, use it for DB
				let levels = JSON.parse(fs.readFileSync("./levels.json", "utf8"));
				let characters = [];
				migrateCharacters(levels, characters);
				
				db.dropDatabase();
				db.collection("characters").insertMany(characters, function (err, result){
					
					callback();
				});
			}
			else{
				
				callback();
			}
		});
	},
	
	//Get the DB
	getDB: function(){
		
		return db;
	},
	
	//Update character in DB
	updateCharacter: function(character){
		
		db.collection("characters").updateOne(
			{"_id": character._id},
			{$set: character},
			{upsert: true}
		);
	},
	
	//Update character actives in DB
	updateActive: function(active){
		
		db.collection("actives").updateOne(
			{"_id": active._id},
			{$set: active},
			{upsert: true}
		);
	},
	
	//Remove a character active from DB
	removeActive: function(active){
		
		db.collection("actives").deleteOne(
			{"_id": active._id}
		);
	}
}

/**
* Migrates level to characters array for inserting into DB.
*/
function migrateCharacters(levels, characters){
	
	for(var key in levels){
		
		var character = levels[key];
		if(character._id == null){
			
			character._id = character.id;
			delete character.id;
		}
		if(character.battleLock == null || character.battleLock == true){
			
			character.battleLock = false;
		}
		if(character.items == null){
			
			character.items = ['battle_ticket', 'challenge_ticket', 'battle_potion', 'battle_potion'];
		}
		if(character.active != null){
			
			delete character.active;
		}
		
		characters.push(character);
	}

	fs.unlinkSync("./levels.json");
}