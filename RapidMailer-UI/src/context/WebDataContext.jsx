import { createContext, useState } from "react";
import axios from 'axios';


export const WebDataContext = createContext();


export function WebDataProvider({children}){

    const [webData, setWebData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchWebData = async(keyword, location) => {
        console.log('here is fetchWebMapData...', keyword , location);
        setLoading(true);
        try{
            const response = await axios.get("http://localhost:5000/api/extract-emails", {
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