exports.BASE_WAIT_TIME = 4200000 //70 minutes
exports.MAX_HP = 100;
exports.BASE_POW = 40;
exports.BASE_WIS = 40;
exports.BASE_DEF = 35;
exports.BASE_RES = 1;
exports.BASE_SPD = 10;
exports.BASE_LUK = 0;

//HP
//Mainly affects chance of victory
exports.calculateBaseHP = function(character){
	
	return exports.MAX_HP;
}

//POW
//Mainly affects chance of victory
exports.calculateBasePOW = function(character){
	
	return exports.BASE_POW + character.level;
}

//WIS
//Mainly affects chance of victory. Less impactful than POW.
exports.calculateBaseWIS = function(character){
	
	return exports.BASE_WIS + character.level;
}

//DEF
//Mainly affects HP loss during battle
exports.calculateBaseDEF = function(character){
	
	return exports.BASE_DEF + Math.ceil(character.level/2);
}

//RES
//Mainly affects chances of avoiding bad active effects
exports.calculateBaseRES = function(character){
	
	return exports.BASE_RES + Math.floor(character.level/10);
}

//SPD
//Mainly affects time until next battle
exports.calculateBaseSPD = function(character){
	
	return exports.BASE_SPD;
}

//LUK
//Mainly affects loot rolls and percentage of extra gold gained
exports.calculateBaseLUK = function(character){
	
	return exports.BASE_LUK;
}

//Calculates wait time based on base wait time and spd
exports.calculateWaitTime = function(character){
	
	//Every point of speed is 1 minute less wait
	var waitTime = exports.BASE_WAIT_TIME - (character.spd * 60000);
	return waitTime;
}

//Level up (or down) a character and adjust stats
exports.levelChange = function(character, change){
	
	if(change != 0){
		
		character.level += change;
		exports.calculateStats(character);
	}
}

//Calculate stats
exports.calculateStats = function(character){
	
	//TODO add class mods when ready
	character.pow = exports.calculateBasePOW(character) + character.powMod + character.powEq;
	character.wis = exports.calculateBaseWIS(character) + character.wisMod + character.wisEq;
	character.def = exports.calculateBaseDEF(character) + character.defMod + character.defEq;
	character.res = exports.calculateBaseRES(character) + character.resMod + character.resEq;
	character.spd = exports.calculateBaseSPD(character) + character.spdMod + character.spdEq;
	character.luk = exports.calculateBaseLUK(character) + character.lukMod + character.lukEq;
}

//Resist active effect message
exports.resistMessage = function(eventName){
	
	return "You resisted " + eventName + "!";
}