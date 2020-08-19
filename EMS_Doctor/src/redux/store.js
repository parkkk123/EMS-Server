import { createStore, applyMiddleware, combineReducers } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'

import clockReducer from './reducers/clock'

const rootReducer = combineReducers({
    clockReducer
})

export function initializeStore (initialState = {}) {
  return  createStore(
    rootReducer,
    initialState,
    composeWithDevTools(applyMiddleware())
  )
}