import { useState, useEffect } from 'react';
import axios from 'axios';
import { manageError } from '../api/api';
import { getListaStorico, getTipoReportCon } from '../api/apiPagoPa/storicoContestazioni/api';
import { BodyStoricoContestazioni, ContestazioneRowGrid, TipologieDoc } from '../page/prod_pn/storicoContestazioni';
import { month } from '../reusableFunction/reusableArrayObj';
import { getAnniContestazioni } from '../api/apiPagoPa/notifichePA/api';


function usePaginatedFetch(apiUrl, initialPage = 1, initialPageSize = 10, globalContextObj) {

    const {dispatchMainState,mainState} = globalContextObj;

    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    const [bodyGetLista,setBodyGetLista] = useState<BodyStoricoContestazioni>({
        anno:'',
        mese:'',
        idEnti:[],
        idTipologiaReports:[]
    });

    const [loading, setLoading] = useState(false);
    const [dataGrid,setDataGrid] = useState<ContestazioneRowGrid[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalContestazioni, setTotalContestazioni]  = useState(0); // To manage total pages if available
    const [valueYears, setValueYears] = useState<string[]>([]);
    const [tipologieDoc, setTipologieDoc] = useState<TipologieDoc[]>([]);


 


    const getListaContestazioni = async(body,pag, rowpag) => {
        
        await getListaStorico(token,profilo,body,pag,rowpag)
            .then((res)=>{

                // ordino i dati in base all'header della grid
                const orderDataCustom = res.data.reports.map((obj)=>{
                    // inserire come prima chiave l'id se non si vuol renderlo visibile nella grid
                    // 'id serve per la chiamata get dettaglio dell'elemento selezionato nella grid
                    return {
                        uniqueId:obj.uniqueId,
                        ragioneSociale:obj.ragioneSociale,
                        categoriaDocumento:obj.categoriaDocumento,
                        stato:'',//findStatoContestazioni(obj.stato),
                        mese:month[obj.mese-1],
                        anno:obj.anno,
                        dataInserimento:new Date(obj.dataInserimento).toISOString().split('T')[0]
                    };
                });
                setDataGrid(orderDataCustom);
                setTotalContestazioni(res.data.count);
                setLoading(false);
            })
            .catch((err)=>{
                setDataGrid([]);
                setTotalContestazioni(0);
                setLoading(false);
                manageError(err,dispatchMainState);
            });
    };


    const getAnni = async() => {
        setLoading(true);
        await getAnniContestazioni(token,profilo.nonce)
            .then((res)=>{
                setBodyGetLista((prev)=> ({...prev, ...{anno:res.data[0]}}));
                setValueYears(res.data);
                getListaContestazioni({...bodyGetLista,...{anno:res.data[0]}},page+1,rowsPerPage);
            })
            .catch((err)=>{
                setLoading(false);
                manageError(err,dispatchMainState);
            });
    };

    const listaTipoReport = async () =>{
        await getTipoReportCon(token, profilo.nonce)
            .then((res)=>{
                setTipologieDoc(res.data);
            })
            .catch(((err)=>{
                setTipologieDoc([]);
                manageError(err,dispatchMainState);
            }));
    };

    useEffect(()=>{
        listaTipoReport(); 
        getAnni();
       
    },[]);


    useEffect(() => {

        getListaContestazioni(bodyGetLista,page,rowsPerPage);
        
    }, [apiUrl, page, page]);

    return { dataGrid, loading, page, setPage, setRowsPerPage, totalContestazioni,valueYears };
}

export default usePaginatedFetch;
