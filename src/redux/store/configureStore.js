import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunk from 'redux-thunk'

import userReducer from '../reducers/userReducer'
import CategoriesReducer from '../reducers/categoriesReducer'
import providerReducer from '../reducers/providerReducer'
export default function configureStore() {
    const reducers = combineReducers({

        userData: userReducer,
        categories:CategoriesReducer,
        provider:providerReducer

    })
    let store = createStore(reducers,

        applyMiddleware(thunk)
    )
    return store;
}
