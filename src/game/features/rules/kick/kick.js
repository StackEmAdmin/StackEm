import srsPlusKickTable from './srsplus';

function newKick(table) {
  return kickLibrary(table);
}

function kickLibrary(table) {
  if (table === 'srsPlus') {
    return srsPlusKickTable;
  }
}

export default newKick;
