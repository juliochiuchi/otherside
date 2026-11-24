/** Chaves centralizadas de cache e mutações do iBusquei. */

export const SNAPSHOT_KEY = ['ibusquei', 'snapshot'] as const

export const mutationKeys = {
  createList: ['ibusquei', 'createList'],
  renameList: ['ibusquei', 'renameList'],
  deleteList: ['ibusquei', 'deleteList'],
  createItem: ['ibusquei', 'createItem'],
  updateItem: ['ibusquei', 'updateItem'],
  deleteItem: ['ibusquei', 'deleteItem'],
  createSector: ['ibusquei', 'createSector'],
  renameSector: ['ibusquei', 'renameSector'],
  deleteSector: ['ibusquei', 'deleteSector'],
  finishRound: ['ibusquei', 'finishRound'],
} as const
