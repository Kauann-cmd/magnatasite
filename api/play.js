const PLAYLISTS = {
    funk:      ['4NLoW-cKDBw','hToGSAFPwds','rIuKKV06CZA','J8kbUgAFq4s','S7ZAy-UpJCE','8wsOJaxc8Bs','9wb9QPXv_rs','r3r0RSvTdpc','WQHYbOy7H2g','xLFCcnYSCyE'],
    pagode:    ['kPDM-HPQXNQ','NkQ5kGNVMhI','wY5t8VO7xQI','P1Qd-Wy1oeY','j2v4S2EF5_c','ZkjZe8UYXYE','2iAjxMRHFkc','k5KhbLkqsEA'],
    sertanejo: ['tHoFzAfFq2Q','OC3oTMc5m2I','BvY48miqYzM','KwGaf7MwHOY','Lf3GH4IEF60','8hFlKZHnJq4'],
    trap:      ['r3r0RSvTdpc','RnGTFZYDLPs','9uAFRLtUM_c','9bZkp7q19f0'],
    phonk:     ['IL9nHp2XT2o','9ydt4FI_qqI','2U7VkhPV59I'],
    gospel:    ['LGUyDAjkqTk','DksSMR6BQCY','WreLSZgX9V4'],
    forro:     ['TMWQPTzMMJs','7N4sSbwWJaI','w1w8ERbJJJk'],
    baile:     ['4NLoW-cKDBw','hToGSAFPwds','J8kbUgAFq4s','S7ZAy-UpJCE'],
};

export default function handler(req, res) {
    const { id } = req.query;

    if (!id) return res.status(400).json({ error: 'ID obrigatório' });

    const genre = id.toLowerCase();
    const playlist = PLAYLISTS[genre];

    if (playlist) {
        // É um gênero — pega um ID aleatório da lista
        const randomId = playlist[Math.floor(Math.random() * playlist.length)];
        return res.redirect(302, `https://server1.mtabrasil.com.br/play?id=${randomId}`);
    }

    // ID normal do YouTube
    if (!/^[a-zA-Z0-9_-]{1,50}$/.test(id)) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    return res.redirect(308, `https://server1.mtabrasil.com.br/play?id=${id}`);
}
