import { createContext, useState } from "react";
import axios from 'axios';
import { API_BASE_URL } from '../constants/api';


export const GoogleMapDataContext = createContext();


export function GoogleMapDataProvider({children}){

    const [googleMapData, setGoogleMapData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchGoogleMapData = async(keyword, location) => {
        setLoading(true);
        try{
            // Backend field is `query`, not `keyword` — the two must match.
            const response = await axios.post(`${API_BASE_URL}/google-maps`, {
                query: keyword,
                location,
            });
            setGoogleMapData(response.data);
        }catch(err){
            setError(err.response?.data?.error || err.message || "An error occurred while fetching google map data.");
        }finally{
            setLoading(false);
        }
    };

    const value = {
        googleMapData,
        setGoogleMapData,
        loading,
        setLoading,
        fetchGoogleMapData,
        error,
        setError,
    };

    return(
        <GoogleMapDataContext.Provider value={value}>
            {children}
        </GoogleMapDataContext.Provider>
    );
}
