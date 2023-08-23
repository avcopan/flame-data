import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import actions from "../state/actions";
import fireIcon from "/fire-icon.svg";
import { Bars3BottomRightIcon } from "@heroicons/react/24/outline";

export default function Header() {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user);

  return (
    <nav className="navbar mb-20">
      <div className="navbar-start gap-6">
        <img className="h-16" src={fireIcon} alt="Fire icon" />
        <div className="text-3xl">FlameData</div>
      </div>
      <div className="navbar-end">
        <div>{user && user.email}</div>
        <div className="dropdown dropdown-end dropdown-hover">
          <label tabIndex={0} className="btn btn-ghost m-1">
            <Bars3BottomRightIcon className="h-6 w-6" />
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-32"
          >
            <li>
              <Link to="/">Home</Link>
            </li>
            {user && (
              <li>
                <Link to="/submit">Submit</Link>
              </li>
            )}
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
