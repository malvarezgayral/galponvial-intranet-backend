module.exports = {
    rules: {
        'no-emoji': {
            meta: {
                type: 'problem',
                docs: {
                    description: 'No se permiten emojis ni la palabra "agregar" en los comentarios',
                },
                messages: {
                    noEmoji: 'No se permiten emojis ni la palabra "agregar" en los comentarios 🚫',
                },
                schema: [],
            },
            create(context) {
                const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
                const forbiddenWordRegex = /agregar/i;

                return {
                    Program() {
                        const sourceCode = context.getSourceCode();
                        const comments = sourceCode.getAllComments();

                        comments.forEach((comment) => {
                            // dividir comentario en líneas
                            const lines = comment.value.split('\n');

                            lines.forEach((line, index) => {
                                const text = line.trim();

                                // ignorar líneas vacías
                                if (!text) return;

                                // ignorar líneas que son solo decoración
                                if (/^[-*\/.\s]+$/.test(text)) return;

                                // DEBUG: imprimí qué está evaluando
                                console.log(`🔍 Evaluando línea ${comment.loc.start.line + index}: "${text}"`);
                                console.log(`   Tiene emoji: ${emojiRegex.test(text)}`);
                                console.log(`   Tiene "agregar": ${forbiddenWordRegex.test(text)}`);

                                // revisar emojis o palabra "agregar"
                                if (emojiRegex.test(text) || forbiddenWordRegex.test(text)) {
                                    context.report({
                                        node: comment,
                                        messageId: 'noEmoji',
                                        loc: {
                                            start: {
                                                line: comment.loc.start.line + index,
                                                column: 0,
                                            },
                                            end: {
                                                line: comment.loc.start.line + index,
                                                column: line.length,
                                            },
                                        },
                                    });
                                }
                            });;
                        });
                    },
                };
            },
        },
    },
};
