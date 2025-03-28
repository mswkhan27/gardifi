export default function SSRPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">SSR Page</h1>
      <p>This page is fully rendered on the server.</p>
      <a href="/client" className="mt-4 text-blue-500">Go to Client Page</a>
    </div>
  );
}
