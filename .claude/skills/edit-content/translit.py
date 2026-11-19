"""Serbian Latin -> Cyrillic for single-quoted TypeScript string literals (edits files in place).

Usage:
  python3 translit.py all FILE...      every string literal except import lines (e.g. a whole sr.ts)
  python3 translit.py sr-keys FILE...  only values of `sr:` keys, string or array of strings (content files)

Digraphs lj/nj/dž are converted to љ/њ/џ. Brand/technical tokens (IBAN, BIC, SWIFT, SEPA, PayPal, GiroCode, QR),
URLs and email addresses stay Latin. Words where "nj"/"lj" are two letters (e.g. "konjunkcija") need a manual fix.
Always review the result (git diff).
"""
import re, sys

DIGRAPHS = {'Lj': 'Љ', 'LJ': 'Љ', 'lj': 'љ', 'Nj': 'Њ', 'NJ': 'Њ', 'nj': 'њ', 'Dž': 'Џ', 'DŽ': 'Џ', 'dž': 'џ'}
SINGLE = dict(zip('ABVGDĐEŽZIJKLMNOPRSTĆUFHCČŠabvgdđežzijklmnoprstćufhcčš',
                  'АБВГДЂЕЖЗИЈКЛМНОПРСТЋУФХЦЧШабвгдђежзијклмнопрстћуфхцчш'))
KEEP = re.compile(r'IBAN|BIC|SWIFT|SEPA|PayPal|GiroCode|QR|https?://\S+|\S+@\S+')

def to_cyr(text):
    out, i = [], 0
    for m in KEEP.finditer(text):
        out.append(convert(text[i:m.start()])); out.append(m.group()); i = m.end()
    out.append(convert(text[i:]))
    return ''.join(out)

def convert(t):
    res, i = [], 0
    while i < len(t):
        if t[i:i+2] in DIGRAPHS: res.append(DIGRAPHS[t[i:i+2]]); i += 2
        else: res.append(SINGLE.get(t[i], t[i])); i += 1
    return ''.join(res)

STR = r"'((?:[^'\\]|\\.)*)'"
def lit(m): return "'" + to_cyr(m.group(1)) + "'"

mode, files = sys.argv[1], sys.argv[2:]
for f in files:
    s = open(f).read()
    if mode == 'all':
        # every literal except import paths
        s = '\n'.join(l if l.lstrip().startswith('import ') else re.sub(STR, lit, l) for l in s.split('\n'))
    else:
        # only values of `sr:` keys (a string or an array of strings)
        s = re.sub(r"(\bsr: )(" + STR + r"|\[(?:\s*" + STR + r",?)*\s*\])",
                   lambda m: m.group(1) + re.sub(STR, lit, m.group(2)), s)
    open(f, 'w').write(s)
