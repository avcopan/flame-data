import { useSelector, useDispatch } from "react-redux";

export default function SubmissionStatusTable() {
  const dispatch = useDispatch();
  const submissions = useSelector((store) => store.submissions);

  return (
    <div>
      <table className="table table-auto shadow-2xl overflow-hidden">
        {/* head */}
        <thead>
          <tr>
            <th>Submission</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission, index) => (
            <tr key={index}>
              <td>{submission.smiles}</td>
              <td>{submission.status}</td>
            </tr>
          ))}
          {submissions.length === 0 && (
            <tr>
              <td colSpan={2}>
                This table will show the status of your submissions...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
