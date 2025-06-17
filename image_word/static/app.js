import { play } from './play-audio-element.js';


async function main() {

  const tuuraAudioEl = document.querySelector('audio#tuura');
  const tuuraEmesAudioEl = document.querySelector('audio#tuura-emes');

  const pageRatio = document.body.offsetWidth / document.body.offsetHeight;

  let gridCols = 4, gridRows = 4;
  if (pageRatio > (4/3.5)) {
    [gridCols, gridRows] = [5, 3];
  } else if (pageRatio < (3.5/4)) {
    [gridCols, gridRows] = [3, 5];
  }

  document.documentElement.style.setProperty('--grid-cols', gridCols);
  document.documentElement.style.setProperty('--grid-rows', gridRows);

  const languages = await fetch(`/api/languages/`).then(r => r.json());
  console.log(languages);

  const resp = await fetch(`/api/random_${gridCols}x${gridRows}`).then(r => r.json());
  console.log(resp)

  const chooseRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const words = resp.words;

  const wordToGuess = chooseRandom(words);
  const wordText = wordToGuess.text;

  document.title = `Икъра: ${wordText}`;


  const wordContainer = document.getElementById('word');
  const grid = document.getElementById('grid');

  const IGNORE_CHARS = [' ', '-'];

  // Создаём буквы
  [...wordText].forEach(char => {
    const letter = document.createElement('div');
    letter.classList.add('letter');
    if (IGNORE_CHARS.includes(char)) {
      letter.classList.add('ignore');
    }
    letter.textContent = char;
    wordContainer.appendChild(letter);
  });


  // Создаём сетку
  for (let i = 0; i < gridCols * gridRows; i++) {
    const w = words[i];
    let cell;
    if (w) {
      const imgs = [w.img.url, ...w.img.alts.map(i => i.url)];
      cell = document.createElement('img');
      cell.classList.add('cell');
      cell.src = chooseRandom(imgs);
      cell.dataset.wordId = w.id;
    } else {
      cell = document.createElement('div');
      cell.classList.add('cell');
      cell.textContent = i + 1;
    }
    grid.appendChild(cell);
  }

  // Поддержка мыши

  grid.onclick = function onGridClick(e) {
    if (!e.target.classList.contains('cell')) {
      return;
    }
    const cell = e.target;
    const idx = Array.from(grid.children).indexOf(cell);
    selectedX = idx % gridRows;
    selectedY = Math.floor(idx / gridRows);
    chosenIndex = idx;
    updateSelection();
    console.log(cell);
    const wordId = +cell.dataset.wordId;
    if (wordId === wordToGuess.id) {
      play(tuuraAudioEl);
    } else {
      play(tuuraEmesAudioEl);
    }
  }

  wordContainer.onclick = function onLetterClick(e) {
    if (!e.target.classList.contains('letter')) {
      return;
    }
    const letter = e.target;
    const idx = Array.from(wordContainer.children).indexOf(letter);
    console.log("Буква:", letter.textContent); 
    letterIndex = idx;
    updateSelection();
  }


  // Правый клик — отмена выбора
  window.addEventListener('contextmenu', e => {
    e.preventDefault(); // отменяем контекстное меню
    chosenIndex = null;
    updateSelection();
  });

  // Hover по буквам
  document.querySelectorAll('.letter').forEach((letterEl, idx) => {
    letterEl.addEventListener('mouseenter', () => {
      letterIndex = idx;
      updateSelection();
    });
  });

  // Hover по ячейкам
  document.querySelectorAll('.cell').forEach((cell, idx) => {
    cell.addEventListener('mouseenter', () => {
      selectedX = idx % gridRows;
      selectedY = Math.floor(idx / gridRows);
      updateSelection();
    });
  });


  // Навигация
  let letterIndex = Math.floor(wordText.length / 2);
  let selectedX = 0, selectedY = 0;
  let chosenIndex = null;

  function updateSelection() {
    // Обновляем буквы
    document.querySelectorAll('.letter').forEach((el, i) => {
      el.classList.toggle('selected', i === letterIndex);
    });

    // Обновляем сетку
    document.querySelectorAll('.cell').forEach((el, idx) => {
      const x = idx % gridRows;
      const y = Math.floor(idx / gridRows);
      el.classList.toggle('selected', x === selectedX && y === selectedY);
      el.classList.toggle('chosen', idx === chosenIndex);
    });
  }

  updateSelection();

  let prevButtons = [];
  let prevAxes = [0, 0];
  const axisThreshold = 0.325;

  function pollGamepad() {
    const gp = navigator.getGamepads()[0];
    if (gp) {
      const axes = gp.axes.slice(0, 2);
      const buttons = gp.buttons.map(btn => btn.pressed);

      const dpad = {
        up: buttons[12] && !prevButtons[12],
        down: buttons[13] && !prevButtons[13],
        left: buttons[14] && !prevButtons[14],
        right: buttons[15] && !prevButtons[15]
      };

      const stick = {
        left:  axes[0] < -axisThreshold && prevAxes[0] >= -axisThreshold,
        right: axes[0] >  axisThreshold && prevAxes[0] <=  axisThreshold,
        up:    axes[1] < -axisThreshold && prevAxes[1] >= -axisThreshold,
        down:  axes[1] >  axisThreshold && prevAxes[1] <=  axisThreshold,
      };

      const moveLeft  = dpad.left  || stick.left;
      const moveRight = dpad.right || stick.right;
      const moveUp    = dpad.up    || stick.up;
      const moveDown  = dpad.down  || stick.down;

      // Навигация по гриду
      if (moveLeft)  moveInDirection(-1, 0);
      if (moveRight) moveInDirection(1, 0);
      if (moveUp) moveInDirection(0, -1);
      if (moveDown) moveInDirection(0, 1);

       // Навигация по буквам
      const letterMoveLeft = buttons[4] && !prevButtons[4];
      const letterMoveRight = buttons[5] && !prevButtons[5];

      function moveLetterInDirection(step) {
        const stepNext = () => Math.min(wordText.length-1, Math.max(0, letterIndex + step));
        let next, char;
        do {
            next = stepNext();
            char = wordText[next];
            letterIndex = next;
        } while (IGNORE_CHARS.includes(char) || next !== letterIndex);
      }

      if (letterMoveLeft == letterMoveRight) {
      } else {
        if (letterMoveLeft) moveLetterInDirection(-1);
        if (letterMoveRight) moveLetterInDirection(1);
      }


      // Х: озвучивание
      const pressX = buttons[3] && !prevButtons[3];
      if (pressX) {
        const char = wordText[letterIndex];
        console.log("Буква:", char); // позже — озвучивание
      }

      // todo: выбор и отмена выбор убрать, просто сразу

      // A: выбор
      const pressA = buttons[0] && !prevButtons[0];
      if (pressA) {
        const idx = selectedY * gridRows + selectedX;
        chosenIndex = idx;
      }

      // B: отмена выбора
      const pressB = buttons[1] && !prevButtons[1];
      if (pressB) {
        chosenIndex = null;
      }

      updateSelection();
      prevButtons = buttons;
      prevAxes = axes;
    }

    requestAnimationFrame(pollGamepad);
  }

  function moveInDirection(dx, dy) {
    const currentCell = getCurrentCellCenter();
    const direction = { x: dx, y: dy };

    let bestMatch = null;
    let bestScore = Infinity;

    document.querySelectorAll('.cell').forEach((el, idx) => {
      const rect = el.getBoundingClientRect();
      const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      const vector = { x: center.x - currentCell.x, y: center.y - currentCell.y };
      const length = Math.hypot(vector.x, vector.y);
      const dot = vector.x * direction.x + vector.y * direction.y;
      const angleCos = dot / length; // косинус угла между направлением и вектором к ячейке

      if (angleCos <= 0.5) return; // слишком в стороне

      const score = length / angleCos; // чем меньше — тем лучше (вектор ближе к направлению и ближе по расстоянию)

      if (score < bestScore) {
        bestScore = score;
        bestMatch = { idx, center };
      }
    });

    if (bestMatch) {
      selectedX = bestMatch.idx % gridRows;
      selectedY = Math.floor(bestMatch.idx / gridRows);
    }
  }

  function getCurrentCellCenter() {
    const idx = selectedY * gridRows + selectedX;
    const el = document.querySelectorAll('.cell')[idx];
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }



  window.addEventListener('gamepadconnected', () => {
    console.log('Геймпад подключен');
    prevButtons = [];
    prevAxes = [0, 0];
    pollGamepad();
  });
}

main();
