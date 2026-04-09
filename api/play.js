export default function handler(req, res) {
    const { id, title } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'ID obrigatório' });
    }

    if (!/^[a-zA-Z0-9_-]{1,50}$/.test(id)) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    if (title !== undefined) {
        function sanitize(t) {
            if (!t) return '_';
            let s = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            s = s.replace(/[^a-zA-Z0-9\s]/g, '').trim();
            return s.length === 0 ? '_' : s;
        }
        const slug = sanitize(title).replace(/\s+/g, '_');
        return res.redirect(308, `https://play.mtamusicas.com/${slug}/${id}`);
    }

    return res.redirect(308, `https://server1.mtabrasil.com.br/play?id=${id}`);
}
