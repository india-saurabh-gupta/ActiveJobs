const clean = (value) => String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed', jobs: [] });
  }

  const { q = 'product manager', location = 'India', page = '1' } = req.query || {};
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    return res.status(503).json({
      error: 'Job data provider is not configured. Add ADZUNA_APP_ID and ADZUNA_APP_KEY in Vercel Project Settings → Environment Variables.',
      jobs: []
    });
  }

  try {
    const pageNumber = Math.max(1, Math.min(20, Number(page) || 1));
    const url = new URL(`https://api.adzuna.com/v1/api/jobs/in/search/${pageNumber}`);
    Object.entries({
      app_id: appId,
      app_key: appKey,
      results_per_page: 50,
      what: q,
      where: location,
      content_type: 'application/json'
    }).forEach(([key, value]) => url.searchParams.set(key, String(value)));

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Adzuna returned HTTP ${response.status}`);
    const data = await response.json();

    const jobs = (data.results || []).map((job) => ({
      id: String(job.id),
      title: clean(job.title),
      company: clean(job.company?.display_name),
      location: clean(job.location?.display_name),
      description: clean(job.description),
      url: job.redirect_url,
      created: job.created,
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      source: 'Adzuna',
      contract: clean(job.contract_type),
      category: clean(job.category?.label)
    }));

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ jobs, total: data.count || jobs.length, page: pageNumber, provider: 'Adzuna' });
  } catch (error) {
    console.error('Adzuna API error:', error);
    return res.status(502).json({ error: `Could not retrieve jobs: ${error.message}`, jobs: [] });
  }
};