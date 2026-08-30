import { createContext, useState } from "react";
import axios from 'axios';
import { API_BASE_URL } from '../constants/api';


export const WebDataContext = createContext();


export function WebDataProvider({children}){

    const [webData, setWebData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchWebData = async(keyword, location) => {
        console.log('here is fetchWebMapData...', keyword , location);
        setLoading(true);
        try{
            const response = await axios.get(`${API_BASE_URL}/extract-emails`, {
                params: { keyword, location }
            });
            console.log("response.data:", response.data);
            setWebData(response.data);
        }catch(err){
            setError(err.message || "An error occurred while fetching google web data.");
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