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

  //Equal chance to hit any character
  var random = Math.floor(Math.random() * (characters.length - 0.0001));
  while(characters[random].hp <= 0){

    random = Math.floor(Math.random() * (characters.length - 0.0001));
  }
  return characters[random];
}

//RAID Dumbo
exports.dumbo.dumb_down = function(battleState, message, args, characters, activesMap, boss, turnValueMap, turnIds, turnIndex){

  //All members, no need to do anything here
}
