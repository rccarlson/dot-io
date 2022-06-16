import type { ChordLibraryRecord } from '../data/chordLibrary';
import type { ChordStatistics } from '../models/trainingStatistics';
import type { WordTrainingValues } from 'src/models/wordTrainingValues';
import { useEffect, useRef, useState } from 'react';


const getRandomElementFromArray = <T>(list: T[]): T =>
  list[Math.floor(Math.random() * list.length)];

interface ChordGenerationParameters {
  stats: ChordStatistics[];
  recursionRate: number;
  numberOfTargetChords: number;
  lineLength: number;
  chordsToChooseFrom: ChordLibraryRecord;
  recursionIsEnabledGlobally: boolean;
  speedGoal: number;
  wordTestNumberValue?: WordTrainingValues;
}

//const [internalWordCountState, setinternalWordCountState] = useState<number | null>(null);


/**
 * Generates a list of training chords, based off of the users existing stats, coming from the supplied `chords` parameter
 * If the recursion rate is high enough, this will provide chords that have been typed slowly
 * Otherwise, it will provide chords at random
 *
 * @param parameters
 * @see {@link ChordGenerationParameters}
 */

 let pageAccessedByReload = ( //This checks if the page has been reloaded this will be used to refresh the session variable
  (window.performance.navigation && window.performance.navigation.type === 1) ||
    window.performance
      .getEntriesByType('navigation')
      .map((nav) => nav.type)
      .includes('reload')
);

function removeSessionValueAndSettoFalse(){ //Method to remove session value and set refresh constant back to false
  sessionStorage.removeItem("tempTestDeIncrement");
  pageAccessedByReload = false;
}

export const generateChords = (
  parameters: ChordGenerationParameters,
): string[] => {
  if(parameters.wordTestNumberValue != undefined){
    let wordTestValue = parseInt(parameters.wordTestNumberValue);
    pageAccessedByReload ? removeSessionValueAndSettoFalse() : ''; // Call this incase user refreshed the page mid test to reset the session Variable
     
    sessionStorage.getItem("tempTestDeIncrement") == undefined ? (sessionStorage.setItem("tempTestDeIncrement", JSON.stringify(wordTestValue))) : '';

    let tempDeIncrementValue = parseInt(sessionStorage.getItem("tempTestDeIncrement"));

   // internalWordCountState == null ? setinternalWordCountState(1) : '';
  
    //console.log(internalWordCountState);
    
    let newString : string[] = [];
    const chordLibraryCharacters1 = Object.keys(parameters.chordsToChooseFrom);

    while (newString.join('').length < parameters.lineLength) {
      if(0 == tempDeIncrementValue){
        let valToEvaluate = (newString.length-1) + wordTestValue;
        const loopValue = valToEvaluate - wordTestValue;
        if(loopValue !< 0){
        for(let i =0; i<=loopValue; i++){
          newString.pop();
        }
      }
        break;
      } else{
       newString.push(getRandomElementFromArray(chordLibraryCharacters1));
       tempDeIncrementValue = tempDeIncrementValue - 1;
      }
      sessionStorage.setItem("tempTestDeIncrement", JSON.stringify(tempDeIncrementValue))
      
    }
    return newString;



  } else{
    console.log(parameters.wordTestNumberValue);
    console.log('I am in the old work');
  // * Uncomment the next two lines to use just the alphabet to test with
  // const IS_TESTING = true;
  // if (IS_TESTING) return [...'abcdefghijklmnopqrstuvwxyz'.split('')];

  const chordsSortedByTypingSpeed = parameters.stats.sort(
    (a, b) => b.averageSpeed - a.averageSpeed,
  );

  let chordToFeed = '';
  const numberOfChordsNotConquered = parameters.stats.filter(
    (s) => s.averageSpeed > parameters.speedGoal || s.averageSpeed === 0,
  ).length;
  if (numberOfChordsNotConquered > 0) {
    // Check for one remaining chord with zero speed
    // This happens on the first pass through the chord library
    const chordsWithZeroSpeed = parameters.stats.filter(
      (stat) => stat.averageSpeed === 0,
    );
    if (chordsWithZeroSpeed.length > 0)
      chordToFeed = getRandomElementFromArray(chordsWithZeroSpeed).displayTitle;
    // If there is no chord with zero speed, then we move onto the highest
    else chordToFeed = chordsSortedByTypingSpeed[0].displayTitle;
  }

  const allCharacters: string[] = [chordToFeed].filter((a) => !!a);
  console.log('CHord to feed '+ chordToFeed);
  console.log("All chahsahahshd "+allCharacters)

  const slowestTypedChordsAccountingForDepth = chordsSortedByTypingSpeed
    .slice(0, parameters.numberOfTargetChords)
    .map((s) => s.id);
  const chordLibraryCharacters = Object.keys(parameters.chordsToChooseFrom);

  while (allCharacters.join('').length < parameters.lineLength) {
    const shouldChooseBasedOnSpeed =
      parameters.recursionRate > Math.random() * 100;
    if (
      shouldChooseBasedOnSpeed &&
      parameters.numberOfTargetChords > 0 &&
      parameters.recursionIsEnabledGlobally
    )
      allCharacters.push(
        getRandomElementFromArray(slowestTypedChordsAccountingForDepth),
      );
    else allCharacters.push(getRandomElementFromArray(chordLibraryCharacters));
  }
  console.log("End "+allCharacters)
  return allCharacters;
}
};
