export default function handler(req, res) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');

    const { q, bass } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Parâmetro q obrigatório' });
    }

    if (!/^[a-zA-Z0-9_-]{1,50}$/.test(q)) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    const safeId = encodeURIComponent(q);
    const endpoint = bass === 'true' ? 'playbass' : 'play';
    res.redirect(308, `https://api.waveapi.fun:3333/${endpoint}?id=${safeId}`);
}
