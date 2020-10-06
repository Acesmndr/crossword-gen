/** figure out the next word in the sequence */
const getProbableNextWords = (wordProbability, currentWord, letterPositions, down) => {
  for(var i = 0; i < wordProbability.length; i++) {
    /** get letters of the current word */
    const currentWordLetters = [...currentWord.word];
    /** generate set of next words probabilities in different positions of letters */
    const setOfNextWords = currentWordLetters.reduce((acc, letter, oldLetterIndex) => {
        if(wordProbability[i].letterSets.has(letter)) {
          const newLetterIndex = [...wordProbability[i].word].findIndex(wordLetter => wordLetter === letter);
          const sanityCheck = checkIfItCanBeKept(wordProbability[i], oldLetterIndex, newLetterIndex, currentWord, letter, down, letterPositions);
          if (typeof sanityCheck === 'object') {
            return [...acc, {
              wordIndex: i,
              oldLetterIndex,
              letter,
              newLetterIndex,
              letterPositions: sanityCheck.letterPositions,
              coordinateStartIndex: sanityCheck.coordinateStartIndex,
            }];
          }
        }
        return acc;
    }, []);
    /** If atleast a letter matches then return the word list else check another word */
    if (setOfNextWords.length) {
        return setOfNextWords;
    }
  }
  return [];
}

/** Check if the word position is applicable or not by checking overlaps */
const checkIfItCanBeKept = (nextWord, oldLetterIndex, newLetterIndex, currentWord, letter, down, letterPositions) => {
  if(currentWord.usedIndex &&[currentWord.usedIndex, currentWord.usedIndex + 1, currentWord.usedIndex -1].indexOf(newLetterIndex) >= 0) {
    /** If it touches earlier joint, return */
    return;
  }
  /** get letters of the current word */
  const wordLetters = [...nextWord.word];
  const startIdx = currentWord.coordinateStartIndex;
  /** find the new joint coordinates */
  const letterIdx = {
      x: startIdx.x + (down ? oldLetterIndex : 0),
      y: startIdx.y + (down ? 0 : oldLetterIndex),
  };
  /** find the new word start coordinates from the new join index */
  const newWordStartIdx = {
      x: letterIdx.x - (down ? 0 : newLetterIndex),
      y: letterIdx.y - (down ? newLetterIndex : 0),
  };
  /** find the letter coordinates of all the letters of the new word */
  const letterCoordinates = wordLetters.map((letter, idx) => `${newWordStartIdx.x + (down ? 0 : idx)}${newWordStartIdx.y + (down ? idx : 0)}`);
  /**
   * get possible overlap positions that should be avoided
   * */
  const letterPositionsKeys = Object.keys(letterPositions);
  const possibleIndices = [...new Set(letterPositionsKeys.reduce((acc, letterKey) => {
      const x = parseInt(letterKey.slice(0, 3));
      const y = parseInt(letterKey.slice(3, 6));
      return [...acc, `${x}${y}`, `${x+1}${y}`, `${x-1}${y}`, `${x}${y+1}`, `${x}${y-1}`]
  }, []))];
  /**
   * If there is only one join and it doesn't overlap or touch any existing element then it's valid
   */
  if(letterCoordinates.filter(element => letterPositionsKeys.includes(element)).length === 1 && letterCoordinates.filter(element => possibleIndices.includes(element)).length === 2) {
      return {
        coordinateStartIndex: newWordStartIdx,
        letterPositions: wordLetters.reduce((acc, letter, idx) => Object.assign({
          [`${newWordStartIdx.x + (down ? 0 : idx)}${newWordStartIdx.y + (down ? idx : 0)}`]: letter,
        }, acc), {}),
      };
  }
}

function generateCrossword(inputWords) {
  /** Return if the input is not in the correct format */
  if (!inputWords || !inputWords.length) {
    return new Error('Input words should be an array');
  }
  /** comvert words to uppercase for consistency */
  const words = inputWords.map(word => word.toUpperCase());
  /** find the set of letters that make up the word */
  const letterSets = words.map(word => (new Set([...word].map(letter => letter))));
  /** array of letters
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWZYZ'.split('');
  */
  const ALBHABETS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','Z','Y','Z'];
  /** find the common letters in the data set */
  const commonLetters = ALBHABETS.map((letter) => ({
    letter,
    count: letterSets.reduce((acc, x) => acc + (x.has(letter) ? 1 : 0), 0),
  })).filter(letter => letter.count > 1);
  /** generate the probability index of the word based upon the number of common letters */
  let wordProbability = words.map((word, idx) => ({
    word: word,
    letterSets: letterSets[idx],
    matchIndex: commonLetters.reduce((acc, letterObj) => (acc + (letterSets[idx].has(letterObj.letter) ? letterObj.count : 0)), 0)
  })).sort((a, b) => b.matchIndex - a.matchIndex);
  /** Preliminary output containing the sequential set of words */
  let wordsSelected = [
    Object.assign({
      coordinateStartIndex: { x: 200, y: 200 }
    }, wordProbability.shift())
  ];
  /** 
   * array of oordinates of individual letters in the words selected for the crossword
   * Index started from 200 so that if an substraction occurs the number doesn't
   * drop down to 2 digits
  */
  let letterPositions = [...wordsSelected[0].word].reduce((acc, l, i) => {
    acc[`${200 + i}200`] = l;
    return acc;
  }, {});
  
  let exit = false;

  /** Until another word can be added, loop */
  while(wordProbability.length > 0 && !exit) {
    const lastWord = wordsSelected[wordsSelected.length - 1];
    const newWord = getProbableNextWords(wordProbability, lastWord, letterPositions, wordsSelected.length % 2 === 1);
    if (!newWord || !newWord.length) {
      /** If no other word matches, it's the end of the list */
      exit = true;
    } else {
      /**
       * Currently selecting the first one from the selection list
       * Position of letters are pushed into the coordinate list for further matching
       */
      Object.assign(letterPositions, newWord[0].letterPositions);
      wordsSelected.push(Object.assign({ usedIndex: newWord[0].newLetterIndex, coordinateStartIndex: newWord[0].coordinateStartIndex }, wordProbability.splice(newWord[0].wordIndex, 1)[0]));
    }
  }
  /**
   * Find the minimum X and Y positions to generate the (0, 0) positions
   */
  let minX = Math.min(...wordsSelected.map(word => word.coordinateStartIndex.x));
  let minY = Math.min(...wordsSelected.map(word => word.coordinateStartIndex.y));

  /** Generate the crossword with alternating across and down */
  const crossword = wordsSelected.reduce((acc, word, idx) => {
    const newWord = {
      word: word.word,
      coordinates: {
        x: word.coordinateStartIndex.x - minX,
        y: word.coordinateStartIndex.y - minY,
      },
    };
    if(idx % 2 === 0) {
      acc.across.push(newWord);
    } else {
      acc.down.push(newWord);
    }
    return acc;
  }, { across: [], down: [] });
  return crossword;
}