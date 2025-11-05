export const now = () => Date.now();

export const addSeconds = (sec: number) => now() + sec * 1000;

export const secondsLeft = (ts: number) =>
  Math.max(0, Math.ceil((ts - now()) / 1000));

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
