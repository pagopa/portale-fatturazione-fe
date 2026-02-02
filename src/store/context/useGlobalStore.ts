import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { initialState, reducerMainState } from "../../reducer/reducerMainState";
import { MainState } from "../../types/typesGeneral";


type ApiKeyPage = {
    visible: boolean | null;
    keys: string[];
};

type GlobalStore = {
    /* ---------- MAIN STATE ---------- */
    mainState: MainState;
    dispatchMainState: (action: { type: string; value?: any }) => void;

    appVersion:string;

    /* ---------- UI ---------- */
    openBasicModal_DatFat_ModCom: { visible: boolean; clickOn: string };
    setOpenBasicModal_DatFat_ModCom: (v: { visible: boolean; clickOn: string }) => void;

    showAlert: boolean;
    setShowAlert: (v: boolean) => void;

    openModalInfo: { open: boolean; sentence: string };
    setOpenModalInfo: (v: { open: boolean; sentence: string }) => void;

    errorAlert: { error: number; message: string };
    setErrorAlert: (v: { error: number; message: string }) => void;

    countMessages: number;
    setCountMessages: (v: number) => void;

    statusQueryGetUri: string[];
    setStatusQueryGetUri: (v: any[]) => void;

    /* ---------- EXTRA DATA ---------- */
    mainData: {
        apiKeyPage: ApiKeyPage;
    };
    setMainData: (updater: (prev: GlobalStore["mainData"]) => GlobalStore["mainData"]) => void;
};

export const useGlobalStore = create(
    persist(
        (set, get) => ({
            /* ===== MAIN STATE ===== */
            mainState: initialState,
            appVersion:"0",
            dispatchMainState: (action) =>
                set((state) => ({
                    mainState: reducerMainState(state.mainState, action),
                })),

            /* ===== UI ===== */
            openBasicModal_DatFat_ModCom: { visible: false, clickOn: "" },
            setOpenBasicModal_DatFat_ModCom: (v) =>
                set({ openBasicModal_DatFat_ModCom: v }),

            showAlert: true,
            setShowAlert: (v) => set({ showAlert: v }),

            openModalInfo: { open: false, sentence: "" },
            setOpenModalInfo: (v) => set({ openModalInfo: v }),

            errorAlert: { error: 0, message: "" },
            setErrorAlert: (v) => set({ errorAlert: v }),

            countMessages: 0,
            setCountMessages: (v) => set({ countMessages: v }),

            statusQueryGetUri: [],
            setStatusQueryGetUri: (v) => set({ statusQueryGetUri: v }),

            /* ===== EXTRA DATA ===== */
            mainData: {
                apiKeyPage: {
                    visible: null,
                    keys: [],
                },
            },
            setMainData: (updater) =>
                set((state) => ({
                    mainData: updater(state.mainData),
                }))
        }),
        {
            name: "globalStatePF",
            version: 1,
            partialize: (state: GlobalStore) => ({
                mainState: state.mainState,
                statusQueryGetUri: state.statusQueryGetUri,
                appVersion:process.env.REACT_APP_VERSION
            }),
            migrate: (persistedState: any, version) => {
                return {
                    ...persistedState,
                    mainState: persistedState.mainState,
                    statusQueryGetUri: persistedState.statusQueryGetUri ?? [],
                    appVersion:process.env.REACT_APP_VERSION,
                };
            },
        }
    )
);