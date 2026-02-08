export default function handler(req, res) {
    const { id, bass, level } = req.query;
    
    // Validação básica
    if (!id) {
        return res.status(400).json({ error: 'ID da música é obrigatório' });
    }
    
    let apiUrl;
    
    // Se bass está ativo e tem level, usa a URL de bass
    if (bass === 'true' && level) {
        const levelMap = {
            '1': 'light',
            '2': 'medium',
            '3': 'heavy',
            '4': 'extreme'
        };
        
        const bassLevel = levelMap[level] || 'medium';
        apiUrl = `https://api-music.fantasyresources.net/bass-client?id=${id}&level=${bassLevel}`;
    } else {
        // Caso contrário, usa a URL normal
        apiUrl = `https://api-music.fantasyresources.net/play-client?id=${id}`;
    }
    
    // Redireciona permanentemente para a API da Fantasy Resources
    res.redirect(308, apiUrl);
}
