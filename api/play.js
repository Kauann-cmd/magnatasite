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
    const endpoint = bass === 'true' ? 'play-bass' : 'play';
    res.redirect(308, `https://apimusic.thryl.com.br/${endpoint}?q=${safeId}`);
}
