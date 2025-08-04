export default function SimpleDebugPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Simple Debug Page</h1>
      <p>If you can see this page, Next.js is running successfully!</p>
      <p>Timestamp: {new Date().toISOString()}</p>
      <p>Environment: {process.env.NODE_ENV}</p>
    </div>
  );
}