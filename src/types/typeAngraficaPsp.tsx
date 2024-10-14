import { Dispatch, SetStateAction } from "react";


export interface RequestBodyListaAnagraficaPsp{
    contractIds: string[],
    membershipId: string,
    recipientId: string,
    abi: string
}

export interface MultiSelectPspProps {
    setBodyGetLista:Dispatch<SetStateAction<RequestBodyListaAnagraficaPsp>>,
    dataSelect:OptionMultiselectChackboxPsp[],
    setTextValue:Dispatch<SetStateAction<string>>,
    valueAutocomplete:OptionMultiselectChackboxPsp[],
    setValueAutocomplete:Dispatch<SetStateAction<OptionMultiselectChackboxPsp[]>> 
}

export interface OptionMultiselectChackboxPsp {
    contractId: string,
    name:string
}