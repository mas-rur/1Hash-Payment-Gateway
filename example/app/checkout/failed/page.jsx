export default function Failed() {
  return (
    <div style={{ textAlign: 'center', padding: 64, fontFamily: 'sans-serif' }}>
      <h1>We couldn't confirm that payment</h1>
      <p>No matching transaction was found in time. You can try the checkout again.</p>
    </div>
  );
}
