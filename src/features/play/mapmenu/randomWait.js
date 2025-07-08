export default async function randomWait() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, Math.random() * 1000 * 5 + 1000);
  });
}
