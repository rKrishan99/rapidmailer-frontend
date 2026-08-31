import { createContext, useState } from "react";
import axios from 'axios';
import { API_BASE_URL } from '../constants/api';


export const WebDataContext = createContext();


export function WebDataProvider({children}){

    const [webData, setWebData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchWebData = async(keyword, location) => {
        setLoading(true);
        try{
            const response = await axios.post(`${API_BASE_URL}/extract-emails`, { keyword, location });
            setWebData(response.data);
        }catch(err){
            setError(err.response?.data?.error || err.message || "An error occurred while fetching google web data.");
        }finally{
            setLoading(false);
        }
    };

    const value = {
        webData,
        setWebData,
        loading,
        setLoading,
        fetchWebData,
        error,
        setError,
    };

    return(
        <WebDataContext.Provider value={value}>
            {children}
        </WebDataContext.Provider>
    );
} 