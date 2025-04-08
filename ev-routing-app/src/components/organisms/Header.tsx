import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-blue-400 shadow-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <h1 className="text-white text-3xl font-bold">Recarrgue Aqui</h1>
        <nav>
          <Link to="/" className="text-white hover:underline">Início</Link>
        </nav>
      </div>
    </header>
  );
}
