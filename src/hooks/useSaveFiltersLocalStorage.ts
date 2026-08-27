import { useState, useRef } from "react";

function useSavedFilters(key, defaultFilters = {}) {
  const isInitialRender = useRef(true);
  const [filters, setFilters] = useState(() => {
    // Retrieve saved filters from local storage on initial load
    const savedFilters = localStorage.getItem('filters')||'{}';
    const parsedFilters = JSON.parse(savedFilters);

    if(parsedFilters?.pathPage === key){
      return parsedFilters;
    }else{
      localStorage.removeItem('filters');
      localStorage.removeItem('filtersNested_1');
      return defaultFilters;
    }
        
  });

  const updateFilters = (newFilters) => {
    isInitialRender.current = false;
    setFilters((prevFilters) =>{
      localStorage.setItem('filters', JSON.stringify({
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
    localStorage.removeItem('filters');
        
  };
  return { filters, updateFilters, resetFilters,isInitialRender };
}

export default useSavedFilters;


