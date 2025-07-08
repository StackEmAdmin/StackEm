import { matchSorter } from 'match-sorter';

async function getMaps(query) {
  await fakeNetwork(`getMaps:${query}`);
  let maps = await get();
  if (!maps) {
    maps = [];
  }
  if (query) {
    maps = matchSorter(maps, query, { keys: ['title'] });
  }
  return maps;
}

async function getMap(id) {
  await fakeNetwork(`map:${id}`);
  const maps = await get();
  const map = maps.find((map) => map.id === id);
  return map ?? null;
}

async function createMap() {
  await fakeNetwork();
  const id = Math.random().toString(36).substring(2, 9);
  const map = { id, created: Date.now() };
  const maps = await getMaps();
  maps.unshift(map);
  await set(maps);
  return map;
}

async function updateMap(id, newMap) {
  await fakeNetwork();
  const maps = await getMaps();
  const index = maps.findIndex((map) => map.id === id);
  if (index === -1) {
    throw new Error(`No map found for ${id}`);
  }
  maps[index] = newMap;
  await set(maps);
  return maps[index];
}

async function deleteMap(id) {
  let maps = await getMaps();
  let index = maps.findIndex((map) => map.id === id);
  if (index > -1) {
    maps.splice(index, 1);
    await set(maps);
    return true;
  }
  return false;
}

async function get() {
  return JSON.parse(localStorage.getItem('maps'));
}

async function set(maps) {
  localStorage.setItem('maps', JSON.stringify(maps));
}

let fakeCache = {};

async function fakeNetwork(key) {
  if (!key) {
    fakeCache = {};
  }

  if (fakeCache[key]) {
    return;
  }

  fakeCache[key] = true;
  return new Promise((resolve) => {
    setTimeout(resolve, Math.random() * 500);
  });
}

export { getMaps, getMap, createMap, updateMap, deleteMap };
