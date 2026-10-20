// Событие «бросить купюры в коробку» — слушает 3D-сцена
export const DROP_EVENT = 'ghm:drop'
export const dropNotes = (count = 1) => window.dispatchEvent(new CustomEvent(DROP_EVENT, { detail: count }))
