import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import actions from "../state/actions";
import fireIcon from "/fire-icon.svg";

export default function Header() {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user);

  return (
    <nav className="navbar">
      <div className="navbar-start gap-6">
        <img className="h-16" src={fireIcon} alt="Fire icon" />
        <div className="text-3xl">Flask-React Auth Starter</div>
      </div>
      <div className="navbar-end">
        <div>
          {user && user.email}
        </div>
        <div className="dropdown dropdown-end dropdown-hover">
          <label tabIndex={0} className="btn btn-ghost m-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-32"
          >
            <li>
              <Link to="/">Home</Link>
            </li>
            {user ? (
              <li>
                <a onClick={() => dispatch(actions.logoutUser())}>Log Out</a>
              </li>
            ) : (
              <>
                <li>
                  <Link to="/login">Log In</Link>
                </li>
                <li>
                  <Link to="/login/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
