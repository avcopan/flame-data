import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div className="p-8 min-h[100vh] bg-base-100">
      <header>
        <Header />
      </header>
      <main className="flex flex-col justify-center items-center">
        {children}
      </main>
    </div>
  );
}
