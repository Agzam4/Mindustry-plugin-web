import { useMemo } from 'react';

const COLORS: Record<string, string> = {
    clear: "#00000000",
    black: "#000000FF",
    white: "#FFFFFFFF",
    lightgray: "#BFBFBFFF",
    gray: "#7F7F7FFF",
    darkgray: "#3F3F3FFF",
    blue: "#0000FFFF",
    navy: "#00007FFF",
    royal: "#4169E1FF",
    slate: "#700090FF",
    sky: "#87CEEBFF",
    cyan: "#00FFFFFF",
    teal: "#007F7FFF",
    green: "#00FF00FF",
    acid: "#7FFF00FF",
    lime: "#32CD32FF",
    forest: "#228B22FF",
    olive: "#6B8E23FF",
    yellow: "#FFFF00FF",
    gold: "#FFD700FF",
    goldenrod: "#DAA520FF",
    orange: "#FFA500FF",
    brown: "#8B4513FF",
    tan: "#D2B48CFF",
    brick: "#B22222FF",
    red: "#FF0000FF",
    scarlet: "#FF341CFF",
    coral: "#FF7F50FF",
    salmon: "#FA8072FF",
    pink: "#FF69B4FF",
    magenta: "#FF00FFFF",
    purple: "#8000FFFF",
    violet: "#EE82EEFF",
    maroon: "#B03060FF",

    accent: "#FFD37FFF",
    unlaunched: "#8982EDFF",
    highlight: "#FFFBFFFF",
    stat: "#FFD37FFF",
    negstat: "#E55454FF"
};

interface MarkupTextProps {
    children: any | any[];
}

interface TextSegment {
    text: string;
    color: string;
}

export default function Text({ children }: MarkupTextProps) {
    const segments = useMemo(() => {
        const result: TextSegment[] = [];
        const colorStack: string[] = ['inherit'];

        let i = 0;
        const string = Array.isArray(children) ? children.join("") : `${children}`
        const len = string.length;

        const appendChar = (char: string) => {
            const currentColor = colorStack[colorStack.length - 1];
            const lastSegment = result[result.length - 1];
            if (lastSegment && lastSegment.color === currentColor) {
                lastSegment.text += char;
            } else {
                result.push({ text: char, color: currentColor });
            }
        };

        while (i < len) {
            if (string[i] === '[') {
                const start = i + 1;
                if (start === len) {
                    appendChar('[');
                    break;
                }
                if (string[start] === '[') {
                    appendChar('[');
                    i += 2;
                    continue;
                }
                if (string[start] === ']') {
                    if (colorStack.length > 1) {
                        colorStack.pop();
                    }
                    i += 2;
                    continue;
                }

                const closeIndex = string.indexOf(']', start);
                if (closeIndex === -1) {
                    appendChar('[');
                    i++;
                    continue;
                }

                const tagContent = string.substring(start, closeIndex);

                if (tagContent.startsWith('#')) {
                    const hex = tagContent.substring(1);
                    if (/^[0-9a-fA-F]{6}$/.test(hex) || /^[0-9a-fA-F]{8}$/.test(hex)) {
                        let cssColor = `#${hex.substring(0, 6)}`;

                        if (hex.length === 8) {
                            const r = parseInt(hex.substring(0, 2), 16);
                            const g = parseInt(hex.substring(2, 4), 16);
                            const b = parseInt(hex.substring(4, 6), 16);
                            const a = parseInt(hex.substring(6, 8), 16) / 255;
                            cssColor = `rgba(${r}, ${g}, ${b}, ${a})`;
                        }

                        colorStack.push(cssColor);
                        i = closeIndex + 1;
                        continue;
                    }
                } else {
                    const lowerName = tagContent.toLowerCase();
                    if (COLORS[lowerName]) {
                        colorStack.push(COLORS[lowerName]);
                        i = closeIndex + 1;
                        continue;
                    }
                }

                appendChar('[');
                i++;
                continue;
            }

            appendChar(string[i]);
            i++;
        }

        return result;
    }, [children]);

    return (
        <>
            {segments.map((seg, idx) => (
                <span key={idx} style={{ color: seg.color, whiteSpace: 'break-spaces' }}>
                    {seg.text}
                </span>
            ))}
        </>
    );
};
