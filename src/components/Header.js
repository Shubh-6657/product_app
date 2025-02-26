import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">MyStore</Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/category/electronics">Electronics</Link>
            </li>
            <li>
              <Link href="/category/men's clothing">Men's Clothing</Link>
            </li>
            <li>
              <Link href="/category/women's clothing">Women's Clothing</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;