export default function handler(req, res) {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'ID obrigatório' });
    res.redirect(308, `https://server1.mtabrasil.com.br/play?id=${id}`);
}
