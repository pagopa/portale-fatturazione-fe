import { getPageApiKeyVisible } from "../api/api";
import { useGlobalStore } from "../store/context/useGlobalStore";

export async function apiKeyLoader() {

    const value = localStorage.getItem("globalState");
    console.log({value});
    return true;
/*
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
        */
}