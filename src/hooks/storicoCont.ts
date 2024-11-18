import { useState, useEffect } from 'react';
import axios from 'axios';
import { manageError } from '../api/api';
import { getListaStorico } from '../api/apiPagoPa/storicoContestazioni/api';
import { BodyStoricoContestazioni } from '../page/prod_pn/storicoContestazioni';
import { month } from '../reusableFunction/reusableArrayObj';


function usePaginatedFetch(apiUrl, initialPage = 1, initialPageSize = 10, dispatchMainState) {
    const [bodyGetLista,setBodyGetLista] = useState<BodyStoricoContestazioni>({
        anno:'',
        mese:'',
        idEnti:[],
        idTipologiaReports:[]
    });
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [totalPages, setTotalPages] = useState(1); // To manage total pages if available


    const getListaContestazioni = async(body,pag, rowpag) => {
        
        await getListaStorico('','',body,pag,rowpag)
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
                //setDataGrid(orderDataCustom);
                //setTotalContestazioni(res.data.count);
                //setGetListaContestazioniRunning(false);
            })
            .catch((err)=>{
                //setDataGrid([]);
                //setTotalContestazioni(0);
                //setGetListaContestazioniRunning(false);
                manageError(err,dispatchMainState);
            });
    };



    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                const response = await axios.get(apiUrl, {
                    params: { page, pageSize },
                });

                setData(response.data.items || []); // Adjust based on API response structure
                setTotalPages(response.data.totalPages || 1); // Adjust if the API provides this
            } catch (err:any) {
                manageError(err,dispatchMainState);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [apiUrl, page, pageSize]);

    return { data, loading, page, setPage, pageSize, setPageSize, totalPages };
}

export default usePaginatedFetch;
