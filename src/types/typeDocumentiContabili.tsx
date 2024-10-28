import { GridElementListaPsp } from "./typeAngraficaPsp";

export interface RequestBodyListaDocContabiliPagopa{
    contractIds: string[],
    membershipId: string,
    recipientId: string,
    abi: string,
    quarters:string[],
    year:string
}


export interface DocContabile {
    report: {
        name: string,
        contractId: string,
        tipoDoc: string,
        codiceAggiuntivo: string,
        vatCode: string,
        valuta: string,
        id: 0,
        numero: string,
        data: string,
        bollo: string,
        riferimentoData: string,
        yearQuarter: string,
        posizioni: PosizioniDocContabile[],
        reports: string[]
    },
    psp: GridElementListaPsp
}

export interface PosizioniDocContabile {
    category:string;
    progressivoRiga:number;
    codiceArticolo:string;
    descrizioneRiga:string;
    quantita:number;
    importo:number;
    codIva:string;
    condizioni:string;
    causale:string;
    indTipoRiga:string;
}