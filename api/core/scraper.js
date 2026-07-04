import * as cheerio from 'cheerio';

export const scrapeWebsite = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Saytga ulanib bo'lmadi: ${response.status}`);
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    let titles = [];
    // Umumiy h2, h3 yoki a taglarni yig'ish (namuna)
    $('a.news-title, h2, h3').slice(0, 5).each((i, el) => {
        const text = $(el).text().trim();
        if (text.length > 10) titles.push(text);
    });

    return titles.length > 0 ? titles : ["Hech qanday sarlavha topilmadi."];
};