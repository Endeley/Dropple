export const timelineClock = {
  time: 0,
  playing: false,
  speed: 1,
};

let subscribers = [];

export function play() {
  timelineClock.playing = true;
}

export function pause() {
  timelineClock.playing = false;
}

export function setTime(t) {
  timelineClock.time = t;
  notifySubscribers();
}

export function setSpeed(s) {
  timelineClock.speed = s;
}

export function subscribe(fn) {
  subscribers.push(fn);
  return () => {
    subscribers = subscribers.filter((f) => f !== fn);
  };
}

function notifySubscribers() {
  subscribers.forEach((fn) => fn(timelineClock.time));
}

export function tick(delta) {
  if (!timelineClock.playing) return;
  timelineClock.time += delta * timelineClock.speed;
  notifySubscribers();
}
