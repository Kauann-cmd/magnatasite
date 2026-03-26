export default async function handler(req, res) {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'ID obrigatório' });

    const servers = [
        'https://server1.mtabrasil.com.br',
        'https://server2.mtabrasil.com.br',
        'https://server3.mtabrasil.com.br',
    ];

    for (const server of servers) {
        try {
            const r = await fetch(`${server}/play?id=${id}`, { redirect: 'manual' });
            if (r.status === 302 || r.status === 301 || r.status === 308 || r.ok) {
                const location = r.headers.get('location');
                if (location) return res.redirect(308, location);
                return res.redirect(308, `${server}/play?id=${id}`);
            }
        } catch (e) {}
    }

    return res.status(502).json({ error: 'Servidores indisponíveis' });
}

