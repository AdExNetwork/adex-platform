import { createStore, compose, applyMiddleware, combineReducers } from 'redux'
import reduxImmutableStateInvariant from 'redux-immutable-state-invariant'
import thunk from 'redux-thunk'
import { persistReducers, memoryReducers } from 'reducers'
import history from './history'
import { routerMiddleware, connectRouter } from 'connected-react-router'
import { persistStore, persistCombineReducers } from 'redux-persist'
import localStorage from 'redux-persist/lib/storage'
// import session from 'redux-persist/lib/storage/session'

const reduxRouterMiddleware = routerMiddleware(history)

const persistConfig = {
	key: 'persist',
	storage: localStorage,
	version: 2,
	debug: process.env.NODE_ENV === 'production' ? false : true,
	throttle: 1000,
}

// const configSession = {
//   key: 'session',
//   storage: session,
// }

// const rootReducer = combineReducers(reducers)

// TODO: make session reducer(signin) - RAM reducer (no persist)
const rootReducer = combineReducers({
	persist: persistCombineReducers(persistConfig, persistReducers),
	memory: combineReducers(memoryReducers), // persistCombineReducers(configSession, sessionReducers), //
	router: connectRouter(history),
})

const logger = store => next => action => {
	// if (action.type === 'UPDATE_NEWITEM') {
	//   return next(action)
	// }

	console.groupCollapsed(action.type)
	console.info('dispatching', action)
	let result = next(action)
	console.log('next state', store.getState())
	console.groupEnd(action.type)
	return result
}

function configureStoreProd(initialState) {
	const middlewares = [
		// Add other middleware on this line...

		// thunk middleware can also accept an extra argument to be passed to each thunk action
		// https://github.com/gaearon/redux-thunk#injecting-a-custom-argument
		thunk,
		reduxRouterMiddleware,
	]

	if (process.env.BUILD_TYPE === 'staging') {
		middlewares.push(logger)
	}

	let store = createStore(
		rootReducer,
		initialState,
		compose(applyMiddleware(...middlewares))
	)

	let persistor = persistStore(store)

	return { persistor, store }
}

function configureStoreDev(initialState) {
	const middlewares = [
		// Add other middleware on this line...

		// Redux middleware that spits an error on you when you try to mutate your state either inside a dispatch or between dispatches.
		reduxImmutableStateInvariant(),

		// thunk middleware can also accept an extra argument to be passed to each thunk action
		// https://github.com/gaearon/redux-thunk#injecting-a-custom-argument
		thunk,
		reduxRouterMiddleware,
		logger,
	]

	const composeEnhancers =
		window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose // add support for Redux dev tools
	const store = createStore(
		rootReducer,
		initialState,
		composeEnhancers(applyMiddleware(...middlewares))
	)

	if (module.hot) {
		// Enable Webpack hot module replacement for reducers
		module.hot.accept('../reducers', () => {
			const nextReducer = require('../reducers').default // eslint-disable-line global-require
			store.replaceReducer(nextReducer)
		})
	}

	let persistor = persistStore(store)
	return { persistor, store }
}

const configureStore =
	process.env.NODE_ENV === 'production' ? configureStoreProd : configureStoreDev

export default configureStore()
