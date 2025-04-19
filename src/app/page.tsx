export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Permit Management Dashboard</h1>
      <p className="mt-4">Welcome to the dashboard.</p>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold">Navigation</h2>
        <ul className="mt-4 space-y-2">
          <li>
            <a href="/test-page" className="text-blue-600 hover:underline">Test Page</a>
          </li>
          <li>
            <a href="/clients" className="text-blue-600 hover:underline">Clients</a>
          </li>
          <li>
            <a href="/permits" className="text-blue-600 hover:underline">Permits</a>
          </li>
        </ul>
      </div>
    </div>
  );
} 