import React, { useContext } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import CircularProgress from "../components/CircularProgress";
import { EmailsVerifyContext } from "../context/EmailsVerifyContext";

const ValidationResult = () => {
  const { validEmails, invalidEmails, loading, totalEmails } = useContext(EmailsVerifyContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Validation Results</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-2">
            Valid Emails ({validEmails.length}/{totalEmails})
          </h3>
          <EmailTable emails={validEmails} />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">
            Invalid Emails ({invalidEmails.length}/{totalEmails})
          </h3>
          <InvalidEmailTable emails={invalidEmails} />
        </div>
      </div>
    </div>
  );
};

const EmailTable = ({ emails }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Email</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {emails.map((email) => (
          <TableRow key={email}>
            <TableCell>{email}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const InvalidEmailTable = ({ emails }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Email</TableCell>
          <TableCell>Reason</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {emails.map(({ email, reason }) => (
          <TableRow key={email}>
            <TableCell>{email}</TableCell>
            <TableCell className="capitalize">{reason}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default ValidationResult;