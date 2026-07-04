import * as cheerio from 'cheerio';

// 1. Aniq URL berilganda faqat o'sha saytni o'qish (O'zgarishsiz qoldi)
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

// 2. Butun Internetni tintish (Botlardan himoyalangan yangi versiya)
export const searchWeb = async (query) => {
    try {
        // 1-Qadam: Avval Wikipedia Ochiq API'sidan qidiramiz (100% ishonchli, bloklanmaydi)
        const wikiRes = await fetch(`https://uz.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json`);
        
        if (wikiRes.ok) {
            const wikiData = await wikiRes.json();
            if (wikiData.query && wikiData.query.search.length > 0) {
                let results = [];
                wikiData.query.search.slice(0, 3).forEach(item => {
                    const cleanSnippet = item.snippet.replace(/<\/?[^>]+(>|$)/g, ""); // HTML taglarni tozalash
                    results.push(`📚 ${item.title}:\n${cleanSnippet}...`);
                });
                return results;
            }
        }

        // 2-Qadam: Agar Wiki'dan topilmasa, DuckDuckGo Lite versiyasiga murojaat qilamiz
        const ddgRes = await fetch('https://lite.duckduckgo.com/lite/', {
            method: 'POST', // GET emas, POST ishlatamiz (blokirovkani chetlab o'tish uchun)
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            },
            body: `q=${encodeURIComponent(query)}`
        });

        const html = await ddgRes.text();
        const $ = cheerio.load(html);
        let results = [];

        $('.result-snippet').slice(0, 3).each((i, el) => {
            const snippet = $(el).text().trim();
            if (snippet && snippet.length > 20) results.push(`🔹 ${snippet}`);
        });

        return results.length > 0 ? results : ["Kechirasiz, bu mavzuda ochiq manbalardan ma'lumot topa olmadim."];
    } catch (error) {
        throw new Error("Tarmoqdagi xavfsizlik cheklovlari tufayli qidiruvni amalga oshirib bo'lmadi.");
    }
};