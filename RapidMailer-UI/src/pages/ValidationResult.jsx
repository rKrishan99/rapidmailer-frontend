import React, { useContext } from "react";
import StickyHeadTable from "../components/EmailTable";
import CircularProgress from "../components/CircularProgress";
import { EmailsVerifyContext } from "../context/EmailsVerifyContext";
import PropagateLoader from "react-spinners/PropagateLoader";

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
    <div className="flex flex-col gap-20 p-6 h-full bg-[#233E8B]">
      <h1>Valid emails</h1>
      {loading ? (
        <div className="flex w-full h-[400px] justify-center items-center">
          <PropagateLoader color="#1EAE98" />
        </div>
      ) : (
        <div className="flex flex-col-reverse lg:flex-row gap-16">
          <div className="flex-1 flex-col gap-6">
            <div>
              <h1></h1>
              <StickyHeadTable data={validEmails.map((email) => ({ email }))} />
            </div>
            <button className="bg-[#1EAE98] mt-6 text-white rounded-sm w-[100px] cursor-pointer">
              Export
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-8">
            <h1>Overview</h1>
            <div className="flex flex-col gap-10 items-center">
              <div className="w-[250px]">
                <CircularProgress percentage={percentage} />
              </div>
              <p>Number of valid emails: {validEmails.length}</p>
            </div>
          </div>
        </div>
      )}
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