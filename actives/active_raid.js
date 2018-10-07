///////////
// DUMBO //
///////////
exports.dumbo = function(battleState, message, args, characters, activesMap, boss, turnValueMap, turnIds, turnIndex){

  var raidActiveId;
  if((battleState.phase - 1) % 3 == 0){

    raidActiveId = boss.actives[1]; //Dumb Down
  }
  else{

    raidActiveId = boss.actives[0]; //Wallop
  }
  return raidActiveId;
}

//RAID Dumbo
exports.dumbo.wallop = function(battleState, message, args, characters, activesMap, boss, turnValueMap, turnIds, turnIndex){

  return targetByAggro(characters);
}

//RAID Dumbo
exports.dumbo.dumb_down = function(battleState, message, args, characters, activesMap, boss, turnValueMap, turnIds, turnIndex){

  //All members, no need to do anything here
}

//HELPERS
/**
* Choose a character randomly by aggro.
*/
function targetByAggro(characters){

  //Create weighed array of characters
  var weighedChar = [];
  for(var i = 0; i < characters.length; i++){

    var character = characters[i];
    if(character.hp > 0){

      var weight = character.aggro;
      for(var j = 0; j < weight; j++){

        weighedChar.push(character);
      }
    }
  }

  var random = Math.floor(Math.random() * (weighedChar.length - 1));
  var target = weighedChar[random];
  return target;
}
