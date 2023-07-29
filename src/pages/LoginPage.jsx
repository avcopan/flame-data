import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import actions from "../state/actions";

export default function LoginPage() {
  const dispatch = useDispatch();
  const errorMessage = useSelector((store) => store.error);

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const { mode } = useParams();
  useEffect(() => {
    setIsRegistering(mode == "register");
  }, [mode]);

  const register = () => {
    if (password !== password2) {
      dispatch(actions.retypeError());
    } else {
      dispatch(actions.registerUser({ email, password }));
    }
  };

  const login = () => {
    dispatch(actions.loginUser({ email, password }));
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex flex-col gap-2 w-fit">
        <div className="self-end mb-6">
          <label className="flex gap-2 justify-between items-end label cursor-pointer w-full ">
            {isRegistering ? (
              <span className="label-text">I have an account</span>
            ) : (
              <span className="label-text">I need an account</span>
            )}
            <input
              type="checkbox"
              className="toggle"
              checked={isRegistering}
              onChange={() => setIsRegistering(!isRegistering)}
            />
          </label>
        </div>
        <input
          required
          type="text"
          placeholder="Email"
          className="input input-bordered w-full max-w-xs"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          required
          type="password"
          placeholder="Password"
          className="input input-bordered w-full max-w-xs"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {isRegistering ? (
          <>
            <input
              required
              type="password"
              placeholder="Re-type password"
              className="input input-bordered w-full max-w-xs"
              value={password2}
              onChange={(event) => setPassword2(event.target.value)}
            />
            <button
              className="btn btn-outline mb-4 self-end"
              onClick={register}
            >
              Register
            </button>
          </>
        ) : (
          <button className="btn btn-outline mb-4 self-end" onClick={login}>
            Log In
          </button>
        )}
      </div>
      <div>
        {errorMessage}
        <p>{email}</p>
        <p>{password}</p>
        <p>{password2}</p>
      </div>
    </div>
  );
}
