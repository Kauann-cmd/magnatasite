export default function handler(req, res) {
    const { id, bass, level } = req.query;
    
    if (!id) {
        return res.status(400).json({ error: 'ID da música é obrigatório' });
    }
    
    let apiUrl;
    
    if (bass === 'true' && level) {
        const levelMap = {
            '1': 'light',
            '2': 'medium',
            '3': 'heavy',
            '4': 'extreme',
            '100': 'oloko'
        };
        
        const bassLevel = levelMap[level] || 'medium';
        apiUrl = `https://api-music.fantasyresources.net/bass-client?id=${id}&level=${bassLevel}`;
    } else {
        apiUrl = `https://api-music.fantasyresources.net/play-client?id=${id}`;
    }
    
    res.redirect(308, apiUrl);
}
