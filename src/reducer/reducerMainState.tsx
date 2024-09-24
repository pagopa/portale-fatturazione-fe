import { MainState } from "../types/typesGeneral";
export interface ActionReducerType{
    type:string,
    value:any
}
export function reducerMainState(mainState:MainState, action:ActionReducerType) {
    const updateInfoObj = action.value;
    if (action.type === 'MODIFY_MAIN_STATE') {
    
        return {
            ...mainState, ...updateInfoObj      
        };
    }
}