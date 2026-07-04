export class NLPProcessor {
    constructor() {
        this.vocabulary = new Set();
        this.documents = [];
        
        // His-tuyg'ularni tahlil qilish uchun lug'at (Sentiment Analysis)
        this.positiveWords = ['zo\'r', 'yaxshi', 'ajoyib', 'qoyil', 'rahmat', 'xursand', 'chotki', 'super', 'kerak'];
        this.negativeWords = ['yomon', 'charchadim', 'zerikdim', 'xafa', 'jahl', 'xato', 'muammo', 'og\'riyapti', 'yoqmayapti'];
    }

    // Levenshtein algoritmi (Harfiy xatolarni topish uchun: "slom" -> "salom")
    levenshtein(a, b) {
        const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
        for (let i = 0; i <= a.length; i += 1) matrix[0][i] = i;
        for (let j = 0; j <= b.length; j += 1) matrix[j][0] = j;
        for (let j = 1; j <= b.length; j += 1) {
            for (let i = 1; i <= a.length; i += 1) {
                const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1, 
                    matrix[j - 1][i] + 1, 
                    matrix[j - 1][i - 1] + indicator 
                );
            }
        }
        return matrix[b.length][a.length];
    }

    // Xato yozilgan so'zni bazadagi eng yaqin so'zga to'g'rilash
    correctTypo(word) {
        let bestMatch = word;
        const maxAllowed = word.length <= 3 ? 1 : 2;
        let minDistance = maxAllowed + 1;
        this.vocabulary.forEach(vocabWord => {
            const dist = this.levenshtein(word, vocabWord);
            if (dist < minDistance && Math.abs(word.length - vocabWord.length) <= 1) {
                minDistance = dist;
                bestMatch = vocabWord;
            }
        });
        return bestMatch;
    }

    tokenize(text) {
        const words = text.toLowerCase()
            .replace(/[^\w\s\'oʻgʻ]/gi, '') // O'zbek harflarini ham o'qish uchun
            .split(/\s+/)
            .filter(word => word.length > 2);

        // N-Gram va Fuzzy Logic birga
        const tokens = words.map(w => this.correctTypo(w));
        for (let i = 0; i < words.length - 1; i++) {
            tokens.push(`${words[i]}_${words[i+1]}`);
        }
        return tokens;
    }

    analyzeSentiment(text) {
        const words = text.toLowerCase().split(/\s+/);
        let score = 0;
        words.forEach(word => {
            if (this.positiveWords.includes(word)) score += 1;
            if (this.negativeWords.includes(word)) score -= 1;
        });
        return score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
    }

    train(intent, text) {
        const tokens = this.tokenize(text);
        this.documents.push({ intent, tokens });
        tokens.forEach(token => this.vocabulary.add(token));
    }

    vectorize(text) {
        const tokens = this.tokenize(text);
        const tf = {};
        tokens.forEach(token => { tf[token] = (tf[token] || 0) + 1; });
        const vector = {};
        this.vocabulary.forEach(word => {
            let docsWithWord = 0;
            this.documents.forEach(doc => { if (doc.tokens.includes(word)) docsWithWord++; });
            const idf = docsWithWord === 0 ? 0 : Math.log(this.documents.length / docsWithWord);
            vector[word] = tf[word] ? (tf[word] / tokens.length) * idf : 0;
        });
        return vector;
    }

    predict(text) {
        const inputVector = this.vectorize(text);
        let bestMatch = { intent: 'unknown', score: 0 };

        this.documents.forEach(doc => {
            const docVector = this.vectorize(doc.tokens.join(' '));
            let dotProduct = 0, normA = 0, normB = 0;
            this.vocabulary.forEach(word => {
                const valA = inputVector[word] || 0;
                const valB = docVector[word] || 0;
                dotProduct += valA * valB;
                normA += valA * valA;
                normB += valB * valB;
            });
            const similarity = (normA === 0 || normB === 0) ? 0 : (dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)));
            if (similarity > bestMatch.score) bestMatch = { intent: doc.intent, score: similarity };
        });

        return bestMatch.score > 0.05 ? bestMatch.intent : 'unknown';
    }
}