import { createContext, useState } from "react";
import axios from "axios";

export const UploadedListsContext = createContext();

export function UploadedListsProvider({ children }) {
  const [emailList, setEmailList] = useState([]);

  const value = {
    emailList,
    setEmailList,
    
  };

  return (
    <UploadedListsContext.Provider value={value}>
      {children}
    </UploadedListsContext.Provider>
  );
}
