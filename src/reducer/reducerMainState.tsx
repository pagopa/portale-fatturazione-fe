import { MainState } from "../types/typesGeneral";

export function reducerMainState(mainState:MainState, action:any) {
    const updateInfoObj = action.value;
    if (action.type === 'MODIFY_MAIN_STATE') {
    
        return {
            ...mainState, ...updateInfoObj      
        };
    }
}