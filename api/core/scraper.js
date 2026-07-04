import * as cheerio from 'cheerio';

// 1. Aniq URL berilganda faqat o'sha saytni o'qish
export const scrapeWebsite = async (url) => {
    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        if (!response.ok) throw new Error(`Saytga ulanishda xatolik: ${response.status}`);
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        let titles = [];
        $('a, h1, h2, h3').each((i, el) => {
            const text = $(el).text().trim();
            if (text.length > 25 && !titles.includes(text)) {
                titles.push(text);
            }
        });

        return titles.slice(0, 5).length > 0 ? titles.slice(0, 5) : ["Saytdan yetarlicha ma'lumot topilmadi."];
    } catch (error) {
        throw new Error(error.message);
    }
};

// 2. Hech qanday sayt berilmaganda Butun Internetni tintish (Web Search)
export const searchWeb = async (query) => {
    try {
        // Bloklanmaslik uchun xavfsiz HTML qidiruvidan foydalanamiz
        const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`; 
        
        const response = await fetch(searchUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'uz-UZ,uz;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        });

        if (!response.ok) throw new Error(`Qidiruv tizimiga ulanib bo'lmadi`);

        const html = await response.text();
        const $ = cheerio.load(html);
        let results = [];

        // Qidiruv natijalaridan sarlavha va qisqacha ma'lumotlarni yig'ib olish
        $('.result__body').slice(0, 4).each((i, el) => {
            const title = $(el).find('.result__title').text().trim();
            const snippet = $(el).find('.result__snippet').text().trim();
            if (title && snippet) {
                results.push(`🔹 ${title}\n   ${snippet}`);
            }
        });

        return results.length > 0 ? results : ["Qidiruv bo'yicha internetdan hech narsa topilmadi."];
    } catch (error) {
        throw new Error(error.message);
    }
};