export class NLPProcessor {
    constructor() {
        this.vocabulary = new Set(); // Barcha o'rganilgan so'zlar "lug'ati"
        this.documents = [];         // O'qitish ma'lumotlari to'plami (Dataset)
    }

    // 1-Qadam: Tokenizatsiya va Tozalash (Filtrlash)
    tokenize(text) {
        return text.toLowerCase()
            .replace(/[^\w\s\']/gi, '') // Tinish belgilari va yot belgilarni tozalash
            .split(/\s+/)               // Bo'shliqlar bo'yicha so'zlarga ajratish
            .filter(word => word.length > 2); // "va", "u", "bu" kabi qisqa so'zlarni olib tashlash
    }

    // Levenshtein masofasini hisoblash
    levenshteinDistance(a, b) {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }

    // Imlo xatolarini to'g'rilash (Fuzzy Matching)
    spellCheck(tokens) {
        const vocabArray = Array.from(this.vocabulary);
        if (vocabArray.length === 0) return tokens;

        return tokens.map(token => {
            let bestMatch = token;
            let minDistance = Infinity;
            // Dinamik limit: kalta so'zlar uchun kichikroq xatolik chegarasi
            const maxAllowedDistance = token.length <= 3 ? 1 : 2;

            for (let word of vocabArray) {
                const dist = this.levenshteinDistance(token, word);
                // Agar masofa belgilangan chegaradan kam bo'lsa va bu eng kichik masofa bo'lsa
                if (dist < minDistance && dist <= maxAllowedDistance) {
                    minDistance = dist;
                    bestMatch = word;
                }
            }
            return bestMatch;
        });
    }

    // 2-Qadam: Tizimni "o'qitish" uchun bazaga ma'lumot kiritish
    train(intent, text) {
        const tokens = this.tokenize(text);
        this.documents.push({ intent, tokens });
        tokens.forEach(token => this.vocabulary.add(token));
    }

    // 3-Qadam: Term Frequency (TF) - So'zning bitta gapdagi uchrash chastotasi
    calculateTF(tokens) {
        const tf = {};
        tokens.forEach(token => {
            tf[token] = (tf[token] || 0) + 1;
        });
        for (let word in tf) {
            // So'z sonini umumiy so'zlar soniga bo'lamiz (vaznni aniqlash)
            tf[word] = tf[word] / tokens.length; 
        }
        return tf;
    }

    // 4-Qadam: Inverse Document Frequency (IDF) - So'zning noyoblik darajasi
    calculateIDF(word) {
        let docsWithWord = 0;
        this.documents.forEach(doc => {
            if (doc.tokens.includes(word)) docsWithWord++;
        });
        
        if (docsWithWord === 0) return 0;
        
        // Logarifmik hisoblash (Keng tarqalgan so'zlar qadrini tushirish)
        return Math.log(this.documents.length / docsWithWord);
    }

    // 5-Qadam: Matnni Vektorga aylantirish (TF-IDF Matritsasi)
    vectorizeTokens(tokens) {
        const tf = this.calculateTF(tokens);
        const vector = {};

        this.vocabulary.forEach(word => {
            if (tf[word]) {
                vector[word] = tf[word] * this.calculateIDF(word);
            } else {
                vector[word] = 0;
            }
        });
        
        return vector;
    }

    vectorize(text) {
        const tokens = this.tokenize(text);
        return this.vectorizeTokens(tokens);
    }

    // 6-Qadam: Cosine Similarity orqali bashorat qilish (Prediction)
    predict(text) {
        // Matnni tokenlarga ajratamiz va imlo xatolarini to'g'rilaymiz
        let tokens = this.tokenize(text);
        tokens = this.spellCheck(tokens);
        
        const inputVector = this.vectorizeTokens(tokens);
        let bestMatch = { intent: 'unknown', score: 0 };

        // Foydalanuvchi matnini bazadagi barcha matnlar bilan solishtiramiz
        this.documents.forEach(doc => {
            const docVector = this.vectorizeTokens(doc.tokens);
            
            let dotProduct = 0;
            let normA = 0;
            let normB = 0;

            // Vektorlarning ko'paytmasi va modulini hisoblash
            this.vocabulary.forEach(word => {
                const valA = inputVector[word] || 0;
                const valB = docVector[word] || 0;
                
                dotProduct += valA * valB;
                normA += valA * valA;
                normB += valB * valB;
            });

            normA = Math.sqrt(normA);
            normB = Math.sqrt(normB);

            // Nolga bo'linish xatosining oldini olish
            const similarity = (normA === 0 || normB === 0) ? 0 : (dotProduct / (normA * normB));

            // Eng yuqori o'xshashlikni (ehtimollikni) saqlab qolish
            if (similarity > bestMatch.score) {
                bestMatch = { intent: doc.intent, score: similarity };
            }
        });

        // Agar o'xshashlik 10% (0.1) dan past bo'lsa, tizim matnni "tushunarsiz" deb belgilaydi
        return bestMatch.score > 0.1 ? bestMatch.intent : 'unknown';
    }
}