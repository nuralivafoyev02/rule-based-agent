export const setupWebhook = async (webhookUrl) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN topilmadi.');

    const tgApi = `https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`;
    const response = await fetch(tgApi);
    const data = await response.json();

    if (!data.ok) throw new Error(data.description);
    return true;
};