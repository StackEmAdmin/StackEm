let intervalID = null;

self.onmessage = (e) => {
  if (e.data.type === 'start') {
    // Set interval to run loop 10 times per second;
    const timeStep = 1000 / 10;
    intervalID = setInterval(() => {
      self.postMessage({ type: 'tick' });
    }, timeStep);
  }

  if (e.data.type === 'stop') {
    clearInterval(intervalID);
  }
};
