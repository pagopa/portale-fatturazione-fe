import { useState, useRef } from "react";

function useSavedFiltersNested(key, defaultFilters = {}) {
    const isInitialRender = useRef(true);
    const [filters, setFilters] = useState(() => {
        // Retrieve saved filters from local storage on initial load
        const savedFilters = localStorage.getItem('filtersNested_1')||'{}';
        const parsedFilters = JSON.parse(savedFilters);

        if(parsedFilters?.pathPage === key){
            return parsedFilters;
        }else{
            localStorage.removeItem('filtersNested_1');
            return defaultFilters;
        }
        
    });

    const updateFilters = (newFilters) => {
        isInitialRender.current = false;
        setFilters((prevFilters) =>{
            localStorage.setItem('filtersNested_1', JSON.stringify({
                ...prevFilters,
                ...newFilters 
            }));
            return  ({
                ...prevFilters,
                ...newFilters
            });
        });
    };

    const resetFilters = () => {
        setFilters(defaultFilters);
        localStorage.removeItem('filtersNested_1');
    };
    return { filters, updateFilters, resetFilters,isInitialRender };
}

export default useSavedFiltersNested;


