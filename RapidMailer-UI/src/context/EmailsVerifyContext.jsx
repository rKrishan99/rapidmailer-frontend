import { createContext, useState } from 'react';
import axios from 'axios';

export const EmailsVerifyContext = createContext();

export function EmailsVerifyProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validEmails, setValidEmails] = useState([]);
  const [invalidEmails, setInvalidEmails] = useState([]);
  const [totalEmails, setTotalEmails] = useState(0);

  const validateEmails = async (emails) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        'http://localhost:5000/api/verify-emails',
        { emails }
      );
      
      setValidEmails(response.data.validEmails);
      setInvalidEmails(response.data.invalidEmails);
      setTotalEmails(emails.length);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    loading,
    error,
    validEmails,
    invalidEmails,
    totalEmails,
    validateEmails,
    reset: () => {
      setValidEmails([]);
      setInvalidEmails([]);
      setTotalEmails(0);
      setError(null);
    }
  };

  return (
    <EmailsVerifyContext.Provider value={value}>
      {children}
    </EmailsVerifyContext.Provider>
  );
}