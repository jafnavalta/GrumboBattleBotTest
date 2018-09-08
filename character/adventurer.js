//Initialize fs
const fs = require("fs");

//List of actives
let activesList = JSON.parse(fs.readFileSync("./values/actives.json", "utf8"));

//For class level functions.
//ALL classes should have these.
exports.className = "Adventurer";

const BASE_POW_EQ = 1;
const BASE_WIS_EQ = -1;
const BASE_DEF_EQ = -1;
const BASE_RES_EQ = 0;
const BASE_SPD_EQ = 0;
const BASE_LUK_EQ = 0;

exports.BASE_POW_EQ = BASE_POW_EQ;
exports.BASE_WIS_EQ = BASE_WIS_EQ;
exports.BASE_DEF_EQ = BASE_DEF_EQ;
exports.BASE_RES_EQ = BASE_RES_EQ;
exports.BASE_SPD_EQ = BASE_SPD_EQ;
exports.BASE_LUK_EQ = BASE_LUK_EQ;

exports.powX = 1;
exports.wisX = 1;
exports.defX = 1;
exports.resX = 1;
exports.spdX = 1;
exports.lukX = 1;

exports.levelUp = {};
exports.setClassLevelFunc = {};
exports.removeClassLevelFunc = {};

//////////////////////////////
// CLASS LEVEL UP FUNCTIONS // //TODO Typically, anything permanent followed by accompanying setClassLevelFunc.
//////////////////////////////
exports.levelUp.adventurer1 = function(character){

  //Does nothing, this is the starting class and level
  exports.setClassLevelFunc.adventurer1(character);
}

exports.levelUp.adventurer2 = function(character){

  exports.setClassLevelFunc.adventurer2(character);
  character.powMod += 2;
  character.wisMod += 2;
  character.defMod += 2;
  character.resMod += 1;
  character.spdMod += 1;
  character.lukMod += 1;
}

exports.levelUp.adventurer3 = function(character){

  exports.setClassLevelFunc.adventurer3(character);
}

exports.levelUp.adventurer4 = function(character){

  exports.setClassLevelFunc.adventurer4(character);
  character.powMod += 2;
  character.wisMod += 2;
  character.defMod += 2;
  character.resMod += 1;
  character.spdMod += 1;
  character.lukMod += 1;
}

exports.levelUp.adventurer5 = function(character){

  exports.setClassLevelFunc.adventurer5(character);
}

exports.levelUp.adventurer6 = function(character){

  exports.setClassLevelFunc.adventurer6(character);
  character.powMod += 2;
  character.wisMod += 2;
  character.defMod += 2;
  character.resMod += 1;
  character.spdMod += 1;
  character.lukMod += 1;
}

exports.levelUp.adventurer7 = function(character){

  exports.setClassLevelFunc.adventurer7(character);
}

exports.levelUp.adventurer8 = function(character){

  exports.setClassLevelFunc.adventurer8(character);
  character.powMod += 2;
  character.wisMod += 2;
  character.defMod += 2;
  character.resMod += 1;
  character.spdMod += 1;
  character.lukMod += 1;
}

exports.levelUp.adventurer9 = function(character){

  exports.setClassLevelFunc.adventurer9(character);
}

exports.levelUp.adventurer10 = function(character){

  exports.setClassLevelFunc.adventurer10(character);
  character.powMod += 2;
  character.wisMod += 2;
  character.defMod += 2;
  character.resMod += 1;
  character.spdMod += 1;
  character.lukMod += 1;
}

/////////////////////////////// //TODO Set class level mods
// SET CLASS LEVEL FUNCTIONS // //TODO Set class level actives
/////////////////////////////// //TODO Set class level skills
exports.setClassLevelFunc.adventurer1 = function(character){

  //Does nothing, this is the starting class and level
}

exports.setClassLevelFunc.adventurer2 = function(character){

}

exports.setClassLevelFunc.adventurer3 = function(character){

}

exports.setClassLevelFunc.adventurer4 = function(character){

}

exports.setClassLevelFunc.adventurer5 = function(character){

}

exports.setClassLevelFunc.adventurer6 = function(character){

}

exports.setClassLevelFunc.adventurer7 = function(character){

}

exports.setClassLevelFunc.adventurer8 = function(character){

}

exports.setClassLevelFunc.adventurer9 = function(character){

}

exports.setClassLevelFunc.adventurer10 = function(character){

}

////////////////////////////////// //TODO Remove class level mods (equips are removed in class.js)
// REMOVE CLASS LEVEL FUNCTIONS // //TODO Remove class level actives
////////////////////////////////// //TODO Remove class level skills
exports.removeClassLevelFunc.adventurer1 = function(character){

  //Does nothing, this is the starting class and level
}

exports.removeClassLevelFunc.adventurer2 = function(character){

}

exports.removeClassLevelFunc.adventurer3 = function(character){

}

exports.removeClassLevelFunc.adventurer4 = function(character){

}

exports.removeClassLevelFunc.adventurer5 = function(character){

}

exports.removeClassLevelFunc.adventurer6 = function(character){

}

exports.removeClassLevelFunc.adventurer7 = function(character){

}

exports.removeClassLevelFunc.adventurer8 = function(character){

}

exports.removeClassLevelFunc.adventurer9 = function(character){

}

exports.removeClassLevelFunc.adventurer10 = function(character){

}
