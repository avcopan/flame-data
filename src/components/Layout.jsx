import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div className="p-8 min-h[100vh] bg-base-100">
      <header>
        <Header />
      </header>
      <main>{children}</main>
    </div>
  );
}
