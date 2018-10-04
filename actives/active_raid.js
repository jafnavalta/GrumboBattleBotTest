///////////
// DUMBO //
///////////
exports.dumbo = function(battleState, message, args, characters, activesMap, boss, turnValueMap, turnIds, turnIndex){

  return boss.actives[0];
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
