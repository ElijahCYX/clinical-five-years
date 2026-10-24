type SaveHandler = () => void

let saveHandler: SaveHandler | null = null
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

export function setSaveHandler(handler: SaveHandler | null) {
  saveHandler = handler
  emit()
}

export function getSaveHandler(): SaveHandler | null {
  return saveHandler
}

export function subscribeSave(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function requestSave(): boolean {
  if (!saveHandler) return false
  saveHandler()
  return true
}
