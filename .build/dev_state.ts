import { EventEmitter } from 'node:events'

interface DevState {
  html: undefined | string
}

const devState: DevState = {
  html: undefined,
}

const updateState = (newValue: string) => {
  devState.html = newValue
}

const devEvents = new EventEmitter()

export { updateState, devState, devEvents }
