# Crossword Generator (crossword-gen)
[![npm](https://img.shields.io/badge/npm-v1.0.0-green.svg)]()
[![license](https://img.shields.io/npm/l/express.svg)]()

Generate crossword from a set of words.

 
## Installation

```shell
npm i crossword-gen
```

## Usage
```js
  import { generateCrossword } from 'crossword-gen';
  const inputWords = [
    { answer: 'BATMAN', xx: 'xxxx'},
    { answer: 'SUPERMAN', xx: 'xxxxx'}
  ];
  const crosswordInput = generateCrossword(inputWords);
  /**
   * Output format example
   * crosswordInput = {
   *  across: [ { answer: 'BATMAN', xx: 'xxxx', row: 7, col: 0 } ],
   *  down: [ { answer: 'SUPERMAN', xx: 'xxxxx', row: 0, col: 5 } ]
   *  }
   * }
```

### Input
Input needs to be an array of object with each object having atleast an answer key.
The rest of the keys in the object is returned as it is in the output.

## Author

Aashish Manandhar <acesmndr@gmail.com> http://github.com/acesmndr

## License

 - **MIT** : http://opensource.org/licenses/MIT

[![forthebadge](http://forthebadge.com/images/badges/uses-js.svg)](http://forthebadge.com)
[![forthebadge](http://forthebadge.com/images/badges/built-with-love.svg)](http://forthebadge.com)


