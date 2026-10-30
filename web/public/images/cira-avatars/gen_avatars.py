"""Genera un catálogo de avatares SVG planos (estilo flat, sin rostro)."""
import os, json

OUT = "cira-avatars"
os.makedirs(f"{OUT}/svg", exist_ok=True)

SKIN = {
    "s1": ("#F6D7C3", "#E8BFA6"),
    "s2": ("#EFC3A1", "#DDA985"),
    "s3": ("#D9A07A", "#C48863"),
    "s4": ("#A9714B", "#93603D"),
    "s5": ("#7A4E33", "#663F28"),
}

def shade(hex_, f=0.85):
    h = hex_.lstrip("#")
    r, g, b = (int(h[i:i+2], 16) for i in (0, 2, 4))
    return "#%02X%02X%02X" % (int(r*f), int(g*f), int(b*f))

# ---------- piezas de pelo ----------
# Cabeza: elipse centro (50,45) rx 12.5 ry 15.5  -> y de 29.5 a 60.5
def hair(style, c):
    d = shade(c, 0.88)
    back, front = "", ""
    if style == "short":
        front = f'<path d="M37.2 44 C35 27 46 24.5 52 25.5 C61 26.5 65.5 33 62.8 44 C61 37 56 34.5 50 34.5 C44 34.5 39 37 37.2 44Z" fill="{c}"/>'
    elif style == "quiff":
        front = (f'<path d="M37.2 45 C35.5 30 41 24 49 23 C55 20 64 23 63.5 30 C64.5 35 63.5 40 62.8 45 C61.5 38 58 35.5 52 35 C47 32 41 37 37.2 45Z" fill="{c}"/>'
                 f'<path d="M45 24 C52 18 62 20 63.5 28 C57 25 51 25 45 24Z" fill="{d}"/>')
    elif style == "spiky":
        front = f'<path d="M37 44 C36 36 37 31 40 28 L39 22 L45 25.5 L47 19.5 L51.5 24.5 L56 19 L57.5 25 L63 22 L61.5 29 C64 33 64 39 63 44 C60.5 37 56 35 50 35 C44 35 39.5 37 37 44Z" fill="{c}"/>'
    elif style == "side":
        front = f'<path d="M37.2 46 C35 29 44 24 51 24.5 C60 25 66 31 62.8 46 C62 39 60 35.5 57 34 C50 38 42 37 37.2 46Z" fill="{c}"/>'
    elif style == "buzz":
        front = f'<path d="M37.6 42 C37 30 45 27.5 50 27.5 C55 27.5 63 30 62.4 42 C60 36 55.5 33.5 50 33.5 C44.5 33.5 40 36 37.6 42Z" fill="{c}"/>'
    elif style == "long":
        back = f'<path d="M35 44 C33 24 67 24 65 44 L67 80 C60 84 40 84 33 80Z" fill="{d}"/>'
        front = f'<path d="M37.2 47 C34 30 42 25 50 25 C58 25 66 30 62.8 47 C61 40 56 34 50 33 C51 38 46 41 37.2 47Z" fill="{c}"/>'
    elif style == "longcurtain":
        back = f'<path d="M34.5 44 C33 23 67 23 65.5 44 L66 82 C60 85 40 85 34 82Z" fill="{d}"/>'
        front = (f'<path d="M37 50 C33 28 46 24.5 50 25 C54 24.5 67 28 63 50 C62 41 57 36 50 33 C43 36 38 41 37 50Z" fill="{c}"/>'
                 f'<path d="M50 25 L50 33" stroke="{d}" stroke-width="0.8"/>')
    elif style == "bob":
        back = f'<path d="M34 46 C32 24 68 24 66 46 L66 62 C60 64 40 64 34 62Z" fill="{d}"/>'
        front = f'<path d="M36.5 50 C33 28 45 24.5 51 25 C59 25.5 67 31 63.5 48 C61 39 54 36 44 37 C40 40 38 44 36.5 50Z" fill="{c}"/>'
    elif style == "pixie":
        front = f'<path d="M37 47 C34 30 44 23.5 51 24 C60 24.5 66 30 63 44 C61 38 58 35 54 34.5 C49 39 43 39 41 37 C39 40 38 43 37 47Z" fill="{c}"/>'
    elif style == "curly":
        blobs = [(38,35,6),(43,29,6.5),(50,27,7),(57,29,6.5),(62,35,6),(35,43,5),(65,43,5),
                 (34,52,5),(66,52,5),(35,60,5.2),(65,60,5.2),(38,67,5),(62,67,5)]
        back = "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{d}"/>' for x, y, r in blobs[5:])
        front = "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}"/>' for x, y, r in blobs[:5])
    elif style == "afro":
        back = f'<circle cx="50" cy="40" r="19" fill="{c}"/>'
        front = f'<path d="M38 40 C40 33 46 32 50 32 C54 32 60 33 62 40 C62 30 56 26 50 26 C44 26 38 30 38 40Z" fill="{d}"/>'
    elif style == "bun":
        back = f'<circle cx="50" cy="22" r="6.5" fill="{c}"/>'
        front = f'<path d="M37.2 45 C35 29 44 26 50 26 C56 26 65 29 62.8 45 C61 38 56 34 50 34 C44 34 39 38 37.2 45Z" fill="{c}"/>'
    elif style == "ponytail":
        back = f'<path d="M58 30 C70 32 70 48 66 60 C64 52 62 44 58 38Z" fill="{d}"/>'
        front = f'<path d="M37.2 46 C35 29 44 25 51 25 C59 25.5 65 31 62.8 44 C60 37 55 34 47 35 C42 37 39 41 37.2 46Z" fill="{c}"/>'
    elif style == "wavy":
        back = f'<path d="M35 42 C31 26 69 26 65 42 C68 52 64 58 67 66 C70 74 64 80 60 80 L40 80 C36 80 30 74 33 66 C36 58 32 52 35 42Z" fill="{d}"/>'
        front = f'<path d="M37 50 C33 29 45 24.5 50 25 C58 25 67 31 63 46 C60 37 54 34 48 34 C44 37 40 42 37 50Z" fill="{c}"/>'
    elif style == "messy":
        front = (f'<path d="M36.8 46 C34.5 33 37 26 44 23.5 C49 21.5 56 22 60 25 C64.5 28 65.5 36 63.2 46 C62 40 60.5 37 58 35.5 C54 37.5 47 37 42 35 C39.5 37.5 38 41 36.8 46Z" fill="{c}"/>'
                 f'<path d="M42 35 C45 31 51 30.5 56 32 C53 33.5 48 35 42 35Z" fill="{d}"/>')
    elif style == "bald":
        front = (f'<path d="M37.5 48 C37 44 37.5 41 38.5 39 L40 47Z" fill="{c}"/>'
                 f'<path d="M62.5 48 C63 44 62.5 41 61.5 39 L60 47Z" fill="{c}"/>')
    return back, front

def clothes(style, c):
    d = shade(c, 0.85)
    base = f'<path d="M16 100 C16 80 30 71 50 71 C70 71 84 80 84 100Z" fill="{c}"/>'
    if style == "tee":
        return base + f'<path d="M43 71.4 C44 76 56 76 57 71.4Z" fill="{d}"/>'
    if style == "vneck":
        return base + f'<path d="M43.5 71.3 L50 80 L56.5 71.3Z" fill="{d}"/>'
    if style == "tank":
        return (base + f'<path d="M30 74 C33 85 67 85 70 74 C64 72 58 71 50 71 C42 71 36 72 30 74Z" fill="{SKIN_CUR[0]}"/>'
                f'<path d="M30 74 L34 100 M70 74 L66 100" stroke="{d}" stroke-width="0"/>')
    if style == "suit":
        return (f'<path d="M16 100 C16 80 30 71 50 71 C70 71 84 80 84 100Z" fill="{c}"/>'
                f'<path d="M44 71.3 L50 84 L56 71.3Z" fill="#FFFFFF"/>'
                f'<path d="M48.6 74 L51.4 74 L52.2 90 L50 93 L47.8 90Z" fill="#E4573D"/>'
                f'<path d="M44 71.3 L50 86 L46 100 L40 100 L41 80Z" fill="{d}"/>'
                f'<path d="M56 71.3 L50 86 L54 100 L60 100 L59 80Z" fill="{d}"/>')
    if style == "hoodie":
        return (base + f'<path d="M38 72.5 C40 82 60 82 62 72.5 C58 74 54 75 50 75 C46 75 42 74 38 72.5Z" fill="{d}"/>'
                f'<path d="M46 79 L45.5 88 M54 79 L54.5 88" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round"/>')
    if style == "collar":
        return (base + f'<path d="M43 71.3 L50 78 L46 82Z" fill="#FFFFFF"/>'
                f'<path d="M57 71.3 L50 78 L54 82Z" fill="#FFFFFF"/>')
    return base

SKIN_CUR = SKIN["s1"]

def avatar(bg, skin, hair_style, hair_color, cloth_style, cloth_color):
    global SKIN_CUR
    SKIN_CUR = SKIN[skin]
    sk, sk_d = SKIN[skin]
    hb, hf = hair(hair_style, hair_color)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img">
<defs><clipPath id="c"><circle cx="50" cy="50" r="50"/></clipPath></defs>
<g clip-path="url(#c)">
<rect width="100" height="100" fill="{bg}"/>
<g transform="translate(50 62) scale(1.28) translate(-50 -62)">
{hb}
<path d="M44 54 L56 54 L56 72 C53 74 47 74 44 72Z" fill="{sk_d}"/>
{clothes(cloth_style, cloth_color)}
<ellipse cx="37.3" cy="47" rx="2" ry="3.2" fill="{sk_d}"/>
<ellipse cx="62.7" cy="47" rx="2" ry="3.2" fill="{sk_d}"/>
<ellipse cx="50" cy="45" rx="12.5" ry="15.5" fill="{sk}"/>
<path d="M50 29.5 C57 29.5 62.5 36 62.5 45 C62.5 54 57 60.5 50 60.5Z" fill="{sk_d}" opacity="0.35"/>
{hf}
</g>
</g>
</svg>'''

# Paleta de fondos inspirada en la referencia
BG = {"teal":"#5BC0B5","green":"#A6D46E","yellow":"#F7D54A","pink":"#F7B6C8","sky":"#7FCFE0",
      "blue":"#9DB8E8","orange":"#F28A3C","peach":"#FBE3CF","coral":"#F0675A","brown":"#6B3E1F","lav":"#B9B3E6","gray":"#D3D3D8"}

HAIR = {"black":"#2B2D42","jet":"#1A1A1E","dark":"#3A2A20","brown":"#7A4A28","auburn":"#B4532A","red":"#E2582C",
        "blonde":"#F2C14E","ash":"#C9A27A","gray":"#8C8C8C","white":"#E9E9EC","pink":"#F27BAA",
        "purple":"#5B4FC4","ginger":"#F08A3E"}

CATALOG = [
    ("ana",     "teal",  "s1","longcurtain","dark",   "tee",   "#F07CA0"),
    ("bruno",   "green", "s1","quiff",      "brown",  "tank",  "#FFFFFF"),
    ("camila",  "yellow","s2","bob",        "auburn", "tee",   "#7FD3E6"),
    ("diego",   "pink",  "s5","buzz",       "black",  "tee",   "#F7D54A"),
    ("elena",   "sky",   "s2","curly",      "brown",  "vneck", "#E4573D"),
    ("fabiola", "blue",  "s4","bob",        "white",  "vneck", "#F4F1EA"),
    ("gabriel", "pink",  "s2","quiff",      "dark",   "tee",   "#5AA9E6"),
    ("helena",  "sky",   "s1","pixie",      "pink",   "tank",  "#E4573D"),
    ("ivan",    "green", "s3","side",       "black",  "collar","#7A6A58"),
    ("julia",   "pink",  "s2","long",       "red",    "vneck", "#7B4BB7"),
    ("kevin",   "pink",  "s3","short",      "gray",   "collar","#A3233A"),
    ("laura",   "orange","s2","bob",        "red",    "tank",  "#333A4D"),
    ("mateo",   "teal",  "s2","side",       "brown",  "tee",   "#F7D54A"),
    ("natalia", "peach", "s3","longcurtain","black",  "vneck", "#5BC0B5"),
    ("olivia",  "teal",  "s1","bob",        "ginger", "tee",   "#FFFFFF"),
    ("pablo",   "green", "s3","short",      "brown",  "tee",   "#7FD3E6"),
    ("queren",  "blue",  "s2","longcurtain","purple", "tank",  "#E4573D"),
    ("rafael",  "teal",  "s1","spiky",      "gray",   "tee",   "#F0675A"),
    ("sofia",   "pink",  "s2","wavy",       "ash",    "tank",  "#FFFFFF"),
    ("tamara",  "coral", "s4","ponytail",   "dark",   "vneck", "#F7D54A"),
    ("ulises",  "teal",  "s4","bald",       "white",  "suit",  "#3B4A6B"),
    ("valeria", "pink",  "s1","curly",      "black",  "tank",  "#FFFFFF"),
    ("wendy",   "brown", "s2","long",       "blonde", "vneck", "#7A3B2E"),
    ("ximena",  "blue",  "s1","bob",        "white",  "collar","#7A6A58"),
    ("yara",    "peach", "s1","wavy",       "ginger", "tee",   "#2FA39A"),
    # extras
    ("zoe",     "lav",   "s5","afro",       "black",  "hoodie","#F28A3C"),
    ("andres",  "yellow","s4","short",      "black",  "hoodie","#5B4FC4"),
    ("leo",     "gray",  "s3","messy",      "jet",  "tee",   "#26262B"),
    ("brisa",   "green", "s3","bun",        "dark",   "vneck", "#F07CA0"),
]

entries = []
for id_, bg, skin, hs, hc, cs, cc in CATALOG:
    svg = avatar(BG[bg], skin, hs, HAIR[hc], cs, cc).replace('id="c"', f'id="c-{id_}"').replace("url(#c)", f"url(#c-{id_})")
    with open(f"{OUT}/svg/{id_}.svg", "w") as f:
        f.write(svg)
    entries.append({"id": id_, "svg": svg})

# Módulo TS: catálogo listo para importar (sin dependencias)
ts = ["// Catálogo de avatares predeterminados para CIRA (generado).",
      "export interface AvatarOption { id: string; svg: string; }", "",
      "export const AVATARS: AvatarOption[] = ["]
for e in entries:
    ts.append(f"  {{ id: {json.dumps(e['id'])}, svg: {json.dumps(e['svg'].replace(chr(10), ''))} }},")
ts += ["];", "",
       "/** Devuelve un data URI usable en <img src>. */",
       "export const avatarSrc = (id: string): string => {",
       "  const a = AVATARS.find((x) => x.id === id) ?? AVATARS[0];",
       "  return `data:image/svg+xml;utf8,${encodeURIComponent(a.svg)}`;",
       "};", "",
       "/** Avatar determinístico a partir de un id/correo, para usuarios sin selección. */",
       "export const defaultAvatarFor = (key: string): string => {",
       "  let h = 0;",
       "  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;",
       "  return AVATARS[h % AVATARS.length].id;",
       "};", ""]
with open(f"{OUT}/avatars.ts", "w") as f:
    f.write("\n".join(ts))

# Galería HTML
cells = "".join(f'<figure><div class="av">{e["svg"]}</div><figcaption>{e["id"]}</figcaption></figure>' for e in entries)
html = f"""<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Avatares CIRA</title>
<style>body{{font-family:system-ui,sans-serif;background:#EEEFF2;margin:0;padding:32px}}
h1{{font-size:20px;color:#333}}.grid{{display:grid;grid-template-columns:repeat(7,110px);gap:22px}}
figure{{margin:0;text-align:center}}.av svg{{width:110px;height:110px;display:block}}
figcaption{{font-size:12px;color:#666;margin-top:6px}}</style></head>
<body><h1>Catálogo de avatares — CIRA</h1><div class="grid">{cells}</div></body></html>"""
with open(f"{OUT}/catalogo.html", "w") as f:
    f.write(html)
print(len(entries), "avatares")
