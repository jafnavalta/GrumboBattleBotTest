//Initialize DB functions
let dbfunc = require('../data/db.js');

//Initialize fs
const fs = require("fs");

//Class active helper
let classactivefunc = require('./class_active.js');

//List of actives
let activesList = JSON.parse(fs.readFileSync("./values/actives.json", "utf8"));

//For class level functions.
//ALL classes should have these.
exports.className = "Warrior";

exports.CLASS_LEVEL_MAX = 7;

//Actives
const LEVEL_1_ACTIVE = 'wild_swing';
const LEVEL_3_ACTIVE = 'warcry';
const LEVEL_4_ACTIVE = 'lifesteal';
const LEVEL_5_ACTIVE = 'revenge';
const LEVEL_6_ACTIVE = 'rampage';

const BASE_HP_EQ = 0;
const BASE_POW_EQ = 5;
const BASE_WIS_EQ = -3;
const BASE_SKL_EQ = 0;
const BASE_DEF_EQ = -2;
const BASE_RES_EQ = -3;
const BASE_SPD_EQ = 0;
const BASE_LUK_EQ = 0;
const BASE_TURN_EQ = 0;
const BASE_AGGRO_EQ = 2;

exports.BASE_HP_EQ = BASE_HP_EQ;
exports.BASE_POW_EQ = BASE_POW_EQ;
exports.BASE_WIS_EQ = BASE_WIS_EQ;
exports.BASE_SKL_EQ = BASE_SKL_EQ;
exports.BASE_DEF_EQ = BASE_DEF_EQ;
exports.BASE_RES_EQ = BASE_RES_EQ;
exports.BASE_SPD_EQ = BASE_SPD_EQ;
exports.BASE_LUK_EQ = BASE_LUK_EQ;
exports.BASE_TURN_EQ = BASE_TURN_EQ;
exports.BASE_AGGRO_EQ = BASE_AGGRO_EQ;

exports.hpX = 1.02;
exports.powX = 1.26;
exports.wisX = 0.75;
exports.sklX = 0.85;
exports.defX = 0.85;
exports.resX = 1;
exports.spdX = 1;
exports.lukX = 1;

exports.levelUp = {};
exports.setClassLevelFunc = {};
exports.removeClassLevelFunc = {};

//////////////////////////////
// CLASS LEVEL UP FUNCTIONS // Typically, anything permanent followed by accompanying setClassLevelFunc.
//////////////////////////////
exports.levelUp.warrior1 = function(character){

  exports.setClassLevelFunc.warrior1(character);
  character.powMod += 2;
}

exports.levelUp.warrior2 = function(character){

  exports.setClassLevelFunc.warrior2(character);
  character.powMod += 2;
}

exports.levelUp.warrior3 = function(character){

  exports.setClassLevelFunc.warrior3(character);
  character.powMod += 2;
}

exports.levelUp.warrior4 = function(character){

  exports.setClassLevelFunc.warrior4(character);
  character.powMod += 2;
}

exports.levelUp.warrior5 = function(character){

  exports.setClassLevelFunc.warrior5(character);
  character.powMod += 2;
}

exports.levelUp.warrior6 = function(character){

  exports.setClassLevelFunc.warrior6(character);
  character.powMod += 2;
}

exports.levelUp.warrior7 = function(character){

  exports.setClassLevelFunc.warrior7(character);
  character.powMod += 2;
}

exports.levelUp.warrior8 = function(character){

  exports.setClassLevelFunc.warrior8(character);
  character.powMod += 2;
}

exports.levelUp.warrior9 = function(character){

  exports.setClassLevelFunc.warrior9(character);
  character.powMod += 2;
}

exports.levelUp.warrior10 = function(character){

  exports.setClassLevelFunc.warrior10(character);
  character.powMod += 2;
}

/////////////////////////////// //TODO Set class level mods
// SET CLASS LEVEL FUNCTIONS // //TODO Set class level actives
/////////////////////////////// //TODO Set class level skills
exports.setClassLevelFunc.warrior1 = function(character){

  var active = classactivefunc.getActive(character, LEVEL_1_ACTIVE);
  dbfunc.pushToState(character, active.id, active, active.battleStates, 1);
}

exports.setClassLevelFunc.warrior2 = function(character){

  character.powEq += 10;
}

exports.setClassLevelFunc.warrior3 = function(character){

  var active = classactivefunc.getActive(character, LEVEL_3_ACTIVE);
  dbfunc.pushToState(character, active.id, active, active.battleStates, 1);
  character.spdEq += 2;
  character.powEq += 4;
  character.defEq += 2;
}

exports.setClassLevelFunc.warrior4 = function(character){

  var active = classactivefunc.getActive(character, LEVEL_4_ACTIVE);
  dbfunc.pushToState(character, active.id, active, active.battleStates, 1);
}

exports.setClassLevelFunc.warrior5 = function(character){

  var active = classactivefunc.getActive(character, LEVEL_5_ACTIVE);
  dbfunc.pushToState(character, active.id, active, active.battleStates, 1);
}

exports.setClassLevelFunc.warrior6 = function(character){

  var active = classactivefunc.getActive(character, LEVEL_6_ACTIVE);
  dbfunc.pushToState(character, active.id, active, active.battleStates, 1);
  character.spdEq += 2;
  character.powEq += 2;
  character.sklEq += 1;
}

exports.setClassLevelFunc.warrior7 = function(character){

  character.powEq += 5;
  character.sklEq += 5;
}

exports.setClassLevelFunc.warrior8 = function(character){

}

exports.setClassLevelFunc.warrior9 = function(character){

}

exports.setClassLevelFunc.warrior10 = function(character){

}

////////////////////////////////// Remove class level mods (equips are removed in class.js)
// REMOVE CLASS LEVEL FUNCTIONS // Remove class level actives
////////////////////////////////// Remove class level skills
exports.removeClassLevelFunc.warrior1 = function(character){

  var active = classactivefunc.getActive(character, LEVEL_1_ACTIVE);
  dbfunc.spliceFromState(character, active.id, active, active.battleStates, active);
}

exports.removeClassLevelFunc.warrior2 = function(character){

  character.powEq -= 10;
}

exports.removeClassLevelFunc.warrior3 = function(character){

  var active = classactivefunc.getActive(character, LEVEL_3_ACTIVE);
  dbfunc.spliceFromState(character, active.id, active, active.battleStates, active);
  character.spdEq -= 2;
  character.powEq -= 4;
  character.defEq -= 2;
}

exports.removeClassLevelFunc.warrior4 = function(character){

  var active = classactivefunc.getActive(character, LEVEL_4_ACTIVE);
  dbfunc.spliceFromState(character, active.id, active, active.battleStates, active);
}

exports.removeClassLevelFunc.warrior5 = function(character){

  var active = classactivefunc.getActive(character, LEVEL_5_ACTIVE);
  dbfunc.spliceFromState(character, active.id, active, active.battleStates, active);
}

exports.removeClassLevelFunc.warrior6 = function(character){

  var active = classactivefunc.getActive(character, LEVEL_6_ACTIVE);
  dbfunc.spliceFromState(character, active.id, active, active.battleStates, active);
  character.spdEq -= 2;
  character.powEq -= 2;
  character.sklEq -= 1;
}

exports.removeClassLevelFunc.warrior7 = function(character){

  character.powEq -= 5;
  character.sklEq -= 5;
}

exports.removeClassLevelFunc.warrior8 = function(character){

}

exports.removeClassLevelFunc.warrior9 = function(character){

}

exports.removeClassLevelFunc.warrior10 = function(character){

}
