export default function StatusTable() {
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
          <tr>
            <td>{"CCCCO[O] >> CCC[CH]OO"}</td>
            <td>Processing</td>
          </tr>
          <tr>
            <td>{"CCCCO[O] >> CCC[CH]OO"}</td>
            <td>Already Present</td>
          </tr>
          <tr>
            <td>{"CCCCO[O] >> CCC[CH]OO"}</td>
            <td>Added</td>
          </tr>
          <tr>
            <td>{"CCCCO[O] >> CCC[CH]OO"}</td>
            <td>Failed</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
