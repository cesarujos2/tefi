interface JiraTextNode {
    type: string;
    text: string;
    marks?: { type: string }[];
}

interface JiraContentNode {
    type: string;
    content: JiraTextNode[] | any[];
}

class ParseText {
    public parseMarkdownText(text: string): JiraContentNode[] {
        const lines = text.split('\n');
        const content: JiraContentNode[] = [];

        for (const line of lines) {
            if (line.trim() === '') {
                // Línea vacía
                content.push({
                    type: 'paragraph',
                    content: []
                });
                continue;
            }

            if (line.startsWith('* ')) {
                // Lista con viñetas
                const listItem = {
                    type: 'bulletList',
                    content: [{
                        type: 'listItem',
                        content: [{
                            type: 'paragraph',
                            content: this.parseInlineFormat(line.substring(2))
                        }]
                    }]
                };
                content.push(listItem);
                continue;
            }

            // Párrafo normal
            content.push({
                type: 'paragraph',
                content: this.parseInlineFormat(line)
            });
        }

        return content;
    }

    private parseInlineFormat(text: string): JiraTextNode[] {
        const parts: JiraTextNode[] = [];
        let currentText = '';
        let i = 0;

        while (i < text.length) {
            if (text.substring(i).startsWith('**')) {
                // Procesar texto en negrita
                if (currentText) {
                    parts.push({ type: 'text', text: currentText });
                    currentText = '';
                }

                const endBold = text.indexOf('**', i + 2);
                if (endBold !== -1) {
                    parts.push({
                        type: 'text',
                        text: text.substring(i + 2, endBold),
                        marks: [{ type: 'strong' }]
                    });
                    i = endBold + 2;
                    continue;
                }
            }

            currentText += text[i];
            i++;
        }

        if (currentText) {
            parts.push({ type: 'text', text: currentText });
        }

        return parts;
    }
}

export const parseText = new ParseText();