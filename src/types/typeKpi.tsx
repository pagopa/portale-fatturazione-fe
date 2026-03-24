export interface RequestBodyKpi{
    contractIds: string[],
    membershipId: string,
    recipientId: string,
    providerName: string,
    quarters: string[],
    year: string
}


export interface kpiObj{
    key: string,
    name: string,
    yearQuarter: string,
    recipientId:string,
    totale: number,
    totaleSconto: number,
    link: null,
    kpiList: string,
    posizioni: [
        {
            recipientName: string,
            pspName: string,
            pspId: string,
            recipientId: string,
            yearQuarter: string,
            trxTotal: number,
            valueTotal: number,
            kpiOk: number,
            percSconto: number,
            valueDiscount: number
        }
    ]
}