import constants from '../constants'
 initialState = {
}
export default (state =initialState,action)=>{
    switch(action.type) {
       
        case constants.SET_USER:
                // console.log('Add Game reducer',action.payload);
                state = action.payload;
            return state;
        default:
            return state;
     
    }
    
}