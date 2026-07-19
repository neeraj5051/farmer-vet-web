import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FilterContextType {
  dateRange: string;
  setDateRange: (val: string) => void;
  stateFilter: string;
  setStateFilter: (val: string) => void;
  serviceFilter: string;
  setServiceFilter: (val: string) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [dateRange, setDateRange] = useState('Today');
  const [stateFilter, setStateFilter] = useState('All States');
  const [serviceFilter, setServiceFilter] = useState('All Services');

  return (
    <FilterContext.Provider 
      value={{ dateRange, setDateRange, stateFilter, setStateFilter, serviceFilter, setServiceFilter }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
