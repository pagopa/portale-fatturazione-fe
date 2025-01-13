import { useState,useEffect, useRef } from "react";

interface BodyFilters {
    pathPage:string,
    body:any,
    textAutocomplete?:string,
    valueAutocomplete?:string[],
    page:number,
    row:number,
    valueFgContestazione?:string[]
}

interface FilterHook {
    bodyFilters:BodyFilters
}


function useSavedFilters(key, defaultFilters = {}) {
    const isInitialRender = useRef(true);
    const [filters, setFilters] = useState(() => {
        // Retrieve saved filters from local storage on initial load
        const savedFilters = localStorage.getItem('filters')||'{}';
        const parsedFilters = JSON.parse(savedFilters);
        console.log({parsedFilters});
        if(parsedFilters?.pathPage === key){
            
            return parsedFilters;
        }else{
            localStorage.removeItem('filters');
            return defaultFilters;
        }
        
    });
    /*
    useEffect(() => {
    // Save filters to local storage whenever they change
        if(Object.keys(filters).length > 0){
            isInitialRender.current = false;
            localStorage.setItem('filters', JSON.stringify({...{pathPage:key},...filters}));
        }
    }, [filters]);
    */
    
    const updateFilters = (newFilters) => {
        isInitialRender.current = false;
        setFilters((prevFilters) =>{
            localStorage.setItem('filters', JSON.stringify({
                ...prevFilters,
                ...newFilters
                
            }));
            console.log({prevFilters});
            return  ({
                ...prevFilters,
                ...newFilters
            });
        });
       
    };

    const resetFilters = () => {
        setFilters(defaultFilters);
        localStorage.removeItem('filters');
    };

   

    return { filters, updateFilters, resetFilters,isInitialRender };
}

export default useSavedFilters;


