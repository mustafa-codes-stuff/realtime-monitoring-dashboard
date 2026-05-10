export async function fetchExplanation(anomaly) {
  try {
    const res = await fetch('/api/explain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(anomaly)
    });
    
    if (!res.ok) {
      throw new Error(`API returned status: ${res.status}`);
    }
    
    return await res.json();
  } catch (err) {
    console.error('Error fetching explanation:', err);
    throw err;
  }
}
