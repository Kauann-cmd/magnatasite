export default function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'ID obrigatório' });
    }

    if (!/^[a-zA-Z0-9_-]{1,50}$/.test(id)) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    res.redirect(308, `https://server1.mtabrasil.com.br/play?id=${id}`);
}

