var words = [
  'crevice',
  'alarm',
  'attachment',
  'think',
  'presence',
  'seasonal',
  'weave',
  'fascinate',
  'remark',
  'insurance',
  'variant',
  'grief',
  'long',
  'golf',
  'outlet',
  'salt',
  'halt',
  'ghostwriter',
  'grass',
  'lift'
].map(word => word.toUpperCase());
function generateCrossword(inputWords) {
  const words = inputWords.map(word => word.toUpperCase());
  const letterSets = words.map(word => (new Set([...word].map(letter => letter))))
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWZYZ'.split('');
  const commonLetters = letters.map((letter) => ({
  letter,
  count: letterSets.reduce((acc, x) => acc + (x.has(letter) ? 1 : 0), 0),
  })).filter(letter => letter.count > 1);
  let wordProbability = words.map((word, idx) => ({
  word: word,
  letterSets: letterSets[idx],
  matchIndex: commonLetters.reduce((acc, letterObj) => (acc + (letterSets[idx].has(letterObj.letter) ? letterObj.count : 0)), 0)
  })).sort((a, b) => b.matchIndex - a.matchIndex);
  let wordsSelected = [Object.assign({ coordinateStartIndex: { x: 200, y: 200 } }, wordProbability.shift())];
  let letterPositions = [...wordsSelected[0].word].reduce((acc, l, i) => {
  acc[`${200 + i}200`] = l;
  return acc;
  }, {});
  let nextWord = function(wordProbability, currentWord, letterPositions, down) {
    for(var i = 0; i < wordProbability.length; i++) {
      const currentWordLetters = [...currentWord.word];
      const result = currentWordLetters.reduce((acc, letter, oldLetterIndex) => {
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
      if (result.length) {
          return result;
      }
    }
    return [];
  }
  let checkIfItCanBeKept = (nextWord, oldLetterIndex, newLetterIndex, currentWord, letter, down, letterPositions) => {
    if(currentWord.usedIndex &&[currentWord.usedIndex, currentWord.usedIndex + 1, currentWord.usedIndex -1].indexOf(newLetterIndex) >= 0) {
      // If it touches earlier joint, return 
      return;
    }
    const wordLetters = [...nextWord.word];
    const startIdx = currentWord.coordinateStartIndex;
    const letterIdx = {
        x: startIdx.x + (down ? oldLetterIndex : 0),
        y: startIdx.y + (down ? 0 : oldLetterIndex),
    };
    const newWordStartIdx = {
        x: letterIdx.x - (down ? 0 : newLetterIndex),
        y: letterIdx.y - (down ? newLetterIndex : 0),
    };
    const letterCoordinates = wordLetters.map((letter, idx) => `${newWordStartIdx.x + (down ? 0 : idx)}${newWordStartIdx.y + (down ? idx : 0)}`);
    const letterPositionsKeys = Object.keys(letterPositions);
    const possibleIndices = [...new Set(letterPositionsKeys.reduce((acc, letterKey) => {
        const x = parseInt(letterKey.slice(0, 3));
        const y = parseInt(letterKey.slice(3, 6));
        return [...acc, `${x}${y}`, `${x+1}${y}`, `${x-1}${y}`, `${x}${y+1}`, `${x}${y-1}`, `${x+1}${y+1}`, `${x+1}${y-1}`, `${x-1}${y+1}`]
    }, []))];
    console.log(possibleIndices, letterCoordinates, letter);
    if(letterCoordinates.filter(element => letterPositionsKeys.includes(element)).length === 1 && letterCoordinates.filter(element => possibleIndices.includes(element)).length === 2) {
        return {
          coordinateStartIndex: newWordStartIdx,
          letterPositions: wordLetters.reduce((acc, letter, idx) => Object.assign({
            [`${newWordStartIdx.x + (down ? 0 : idx)}${newWordStartIdx.y + (down ? idx : 0)}`]: letter,
          }, acc), {})
        };
    }
  }
  let isDown = false;
  let exit = false;

  while(wordProbability.length > 0 && !exit) {
    const lastWord = wordsSelected[wordsSelected.length - 1];
    const newWord = nextWord(wordProbability, lastWord, letterPositions, wordsSelected.length % 2 === 1);
    if (!newWord || !newWord.length) {
      exit = true;
    } else {
      Object.assign(letterPositions, newWord[0].letterPositions);
      wordsSelected.push(Object.assign({ usedIndex: newWord[0].newLetterIndex, coordinateStartIndex: newWord[0].coordinateStartIndex }, wordProbability.splice(newWord[0].wordIndex, 1)[0]));
    }
  }

  let minX = Math.min(...wordsSelected.map(word => word.coordinateStartIndex.x));
  let minY = Math.min(...wordsSelected.map(word => word.coordinateStartIndex.y));

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