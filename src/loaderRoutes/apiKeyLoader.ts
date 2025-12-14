import { LoaderFunctionArgs } from "react-router-dom";
import { getPageApiKeyVisible } from "../api/api";
import { useContext } from "react";
import { GlobalContext } from "../store/context/globalContext";

export async function apiKeyLoader() {
    const globalContextObj = useContext(GlobalContext);
    const  { mainState,setMainData,mainData}  = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    try {
        const res = await getPageApiKeyVisible(token, profilo.nonce);

        const newKeys =
        res?.data
            ?.map(el => el.apiKey)
            .filter(el => el !== null) ?? [];

        setMainData(prev => ({
            ...prev,
            apiKeyPage: {
                keys: newKeys,
                ip: [],
                visible: true,
            },
        }));

    } catch (err: any) {
        const status = err?.response?.status;

        if (status === 401) {
            setMainData(prev => ({
                ...prev,
                apiKeyPage: {
                    ...prev.apiKeyPage,
                    visible: false,
                },
            }));
        } else if (status === 404) {
            setMainData(prev => ({
                ...prev,
                apiKeyPage: {
                    ...prev.apiKeyPage,
                    visible: true,
                },
            }));
        } else {
            setMainData(prev => ({
                ...prev,
                apiKeyPage: {
                    ...prev.apiKeyPage,
                    visible: false,
                },
            }));
        }
    }
}