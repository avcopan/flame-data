import { useParams } from "react-router-dom";

export default function DetailPage() {
  const { connId } = useParams();

  return (
    <div>
      <h1>Detail page</h1>
      <div>{connId}</div>
    </div>
  );
}
