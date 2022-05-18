// Set up your root reducer here...
import { combineReducers } from 'redux';
// import {routerReducer} from 'react-router-redux';
import UserReducer from './userReducer'
import CategoriesReducer from './categoriesReducer';
const rootReducer = combineReducers (
    {
        userData:UserReducer,
        categories:CategoriesReducer
    }
)
export default rootReducer;