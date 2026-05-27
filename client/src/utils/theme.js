function hexToHSL(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function applyThemeColor(hex) {
    const root = document.documentElement;
    root.style.setProperty('--primary', hex);

    const { h, s, l } = hexToHSL(hex);
    const darkL = Math.max(l - 15, 5);
    const lightL = Math.min(l + 25, 95);

    root.style.setProperty('--primary-dark', `hsl(${h}, ${s}%, ${darkL}%)`);
    root.style.setProperty('--primary-light', `hsl(${h}, ${s}%, ${lightL}%)`);
    root.style.setProperty('--primary-glow', `hsla(${h}, ${s}%, ${l}%, 0.15)`);
    root.style.setProperty('--sidebar-active', hex);
}