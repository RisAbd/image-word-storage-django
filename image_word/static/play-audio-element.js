
export class StopperToken {
  constructor(rejectWith) {
    this.rejectWith = rejectWith;
  }
  stop() {
    throw new Error('stopper not passed to play')
  }
}

export const play = (audio, from, to, stopperToken=undefined) => new Promise(function (res, rej) {
  let el = audio;
  if (typeof el === 'string') {
    el = document.createElement('audio');
    el.src = audio;
  }

  if (from !== undefined && to === undefined) {
    to = from;
    from = 0;
  }
  if (from === undefined) {
    from = 0;
  }

  function pauseOnEnd(e) {
    // console.log(e);
    if (to !== undefined && el.currentTime >= to) {
      el.pause();
      el.removeEventListener('timeupdate', pauseOnEnd);
      // console.log(e);
      res();
    } else if (el.currentTime >= el.duration) {
      res();
      el.removeEventListener('timeupdate', pauseOnEnd);
    }
  }
  el.addEventListener('timeupdate', pauseOnEnd);

  el.currentTime = from;
  el.play().catch(rej);

  if (stopperToken) {
    stopperToken.stop = (v) => {
      if (!v) {
        v = stopperToken.rejectWith;
      }
      el.removeEventListener('timeupdate', pauseOnEnd);
      el.pause();
      rej(v);
    }
  }
});