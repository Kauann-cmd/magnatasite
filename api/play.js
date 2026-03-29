const GENRES = ['funk', 'pagode', 'sertanejo', 'trap', 'phonk', 'gospel', 'forró', 'baile', 'forro'];
const API = 'https://server1.mtabrasil.com.br';

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) return res.status(400).json({ error: 'ID obrigatório' });

    // YouTube IDs são sempre 11 caracteres
    const isGenre = GENRES.includes(id.toLowerCase()) || id.length !== 11;

    if (!isGenre) {
        // ID normal do YouTube — comportamento original
        return res.redirect(308, `${API}/play?id=${id}`);
    }

    try {
        // Busca músicas do gênero
        const response = await fetch(`${API}/search?q=${encodeURIComponent(id + ' música')}`);
        const data = await response.json();
        const arr = Array.isArray(data) ? data : (data.items || []);

        if (!arr.length) return res.status(404).json({ error: 'Nenhuma música encontrada' });

        // Pega uma aleatória
        const random = arr[Math.floor(Math.random() * arr.length)];
        const videoId = random.id || random.videoId;

        if (!videoId) return res.status(404).json({ error: 'ID não encontrado' });

        return res.redirect(302, `${API}/play?id=${videoId}`);

    } catch (e) {
        return res.status(500).json({ error: 'Erro ao buscar músicas' });
    }
}
