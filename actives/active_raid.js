///////////
// DUMBO //
///////////
exports.dumbo = function(battleState, message, args, characters, activesMap, boss){

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
exports.dumbo.wallop = function(battleState, message, args, characters, activesMap, boss){

  return targetByAggro(characters);
}

//RAID Dumbo
exports.dumbo.dumb_down = function(battleState, message, args, characters, activesMap, boss){

  //All members, no need to do anything here
}

//RAID Grumboracle
exports.grumboracle = function(battleState, message, args, characters, activesMap, boss){

  var raidActiveId;
  //Start with Judgment
  if(battleState.judgment == null){

    battleState.judgment = 0;
    battleState.destiny = 0;
    battleState.seek_the_truth = 0;
    battleState.seek_done = 0;
    return boss.actives[0]; //Judgment
  }

  if(battleState.seek_done < 1 && boss.hp < 7000){

    //Queue Seek the Truth in case second Judgment needs to activate
    battleState.seek_the_truth = 2;
    battleState.seek_done += 1; //Only Seek the Truth once when reaching below 7000
  }
  if(battleState.seek_done < 2 && boss.hp < 2000){

    //Queue Seek the Truth in case second Judgment needs to activate
    battleState.seek_the_truth = 2;
    battleState.seek_done += 1; //Only Seek the Truth once when reaching below 2000
  }
  if((battleState.phase - 3) % 6 == 0){

    //Queue Destiny in case second Judgment needs to activate
    battleState.destiny = 1;
  }

  //Choose active based on Queue
  if(battleState.judgment == 1){

    raidActiveId = boss.actives[0]; //Second Judgment
  }
  else if(battleState.seek_the_truth == 2){

    battleState.seek_the_truth = 1;
    raidActiveId = boss.actives[2]; //Seek the Truth start
  }
  else if(battleState.seek_the_truth == 1){

    battleState.seek_the_truth = 0;
    raidActiveId = boss.actives[2]; //Seek the Truth end
  }
  else if(battleState.phase == 3 || (battleState.phase - 3) % 6 == 0 || battleState.destiny == 1){

    battleState.destiny = 0;
    raidActiveId = boss.actives[1]; //Destiny
  }
  else{

    //Default to Judgment
    raidActiveId = boss.actives[0];
  }
  return raidActiveId;
}

//RAID Grumboracle
exports.grumboracle.judgment = function(battleState, message, args, characters, activesMap, boss){

  return targetByAggro(characters);
}

//RAID Grumboracle
exports.grumboracle.destiny = function(battleState, message, args, characters, activesMap, boss){

  //Get highest res of all raid members
  var highestRes = 0;
  for(var i = 0; i < characters.length; i++){

    var character = characters[i];
    if(character.res > highestRes) highestRes = character.res;
  }
  battleState.highestRes = highestRes;
}

//RAID Grumboracle
exports.grumboracle.seek_the_truth = function(battleState, message, args, characters, activesMap, boss){

  //Get highest wis of all raid members
  var highestWis = 0;
  for(var i = 0; i < characters.length; i++){

    var character = characters[i];
    if(character.wis > highestWis) highestWis = character.wis;
  }
  battleState.highestWis = highestWis;
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
