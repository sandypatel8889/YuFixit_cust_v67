import constants from '../constants'
initialState = []
export default (state =[],action)=>{
    switch(action.type) {
       
        case constants.SET_CATEGORIES:
            return action.payload;
        default:
            return state;
     
    }
    
}