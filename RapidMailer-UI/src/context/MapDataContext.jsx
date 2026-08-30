import { createContext, useState } from "react";
import axios from 'axios';
import { API_BASE_URL } from '../constants/api';


export const GoogleMapDataContext = createContext();


export function GoogleMapDataProvider({children}){

    const [googleMapData, setGoogleMapData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchGoogleMapData = async(keyword, location) => {
        console.log('here is fetchGoogleMapData...', keyword , location);
        setLoading(true);
        try{
            const response = await axios.get(`${API_BASE_URL}/google-maps`, {
                params: { keyword, location }
            });
            console.log("response.data:", response.data);
            setGoogleMapData(response.data);
        }catch(err){
            setError(err.message || "An error occurred while fetching google map data.");
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