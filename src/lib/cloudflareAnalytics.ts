// Utility to fetch Cloudflare Analytics data using GraphQL API
export async function fetchCloudflareAnalytics(query: string, variables: any = {}) {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  if (!apiToken || !zoneId) throw new Error('Cloudflare API token or zone ID missing');

  const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables: { zoneTag: zoneId, ...variables } }),
  });
  const data = await res.json();
  if (!res.ok || data.errors) throw new Error(data.errors?.[0]?.message || 'Cloudflare API error');
  return data.data;
}
