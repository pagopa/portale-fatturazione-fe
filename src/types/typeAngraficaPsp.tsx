import { Dispatch, SetStateAction } from "react";




export interface RequestBodyListaAnagraficaPsp{
    contractIds: string[],
    membershipId: string,
    recipientId: string,
    abi: string
}
/*
export interface MultiselectWithKeyValueProps {
    setBodyGetLista:Dispatch<SetStateAction<RequestBodyListaAnagraficaPsp>>,
    dataSelect:OptionMultiselectCheckboxPsp[],
    setTextValue:Dispatch<SetStateAction<string>>,
    valueAutocomplete:OptionMultiselectCheckboxPsp[],
    setValueAutocomplete:Dispatch<SetStateAction<OptionMultiselectCheckboxPsp[]>> ,
    keyId:string,
    label:string,
    keyArrayName:string,
    valueId:string
}
*/
export interface MultiselectWithKeyValueProps {
    setBodyGetLista:any,
    dataSelect:AutocompleteMultiselect[],
    setTextValue:Dispatch<SetStateAction<string>>,
    valueAutocomplete:AutocompleteMultiselect[],
    setValueAutocomplete:Dispatch<SetStateAction<AutocompleteMultiselect[]>>,
    keyId:string,
    label:string,
    keyArrayName:string,
    valueId:string
}

export interface OptionMultiselectCheckboxPsp{
    contractId: string,
    name:string
}

export interface OptionMultiselectCheckboxQarter{
    value: string,
    quarter:string
}
export type AutocompleteMultiselect = OptionMultiselectCheckboxPsp|OptionMultiselectCheckboxQarter


export interface GridElementListaPsp {
    contractId: string,
    documentName: string,
    providerNames: string,
    signedDate: string,
    contractType: string,
    name: string,
    abi: string,
    taxCode: string,
    vatCode: string,
    vatGroup: number,
    pecMail: string,
    courtesyMail: string,
    referenteFatturaMail: string,
    sdd: string,
    sdiCode: null|number|string,
    membershipId: string,
    recipientId: string,
    yearMonth: string
}

