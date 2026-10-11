# お題のタグを直す：python3 tools/tagfix.py  （FIX に 'お題': 'タグ タグ' を書く。同じ属性の古いタグは置きかえる）
import re, sys, glob, os
ROOT = os.path.join(os.path.dirname(__file__), '..')
def apply(FIX):
    for f in ['topics1.js', 'topics2.js', 'topics3.js']:
        p = os.path.join(ROOT, f); lines = open(p, encoding='utf8').read().split('\n'); ch = 0
        for i, l in enumerate(lines):
            tok = l.split()
            if len(tok) < 3 or '/' in tok[0] and False: pass
            if not tok: continue
            name = tok[0].split('/')[0]
            if name in FIX and len(tok) >= 3 and re.match(r'^[0-4]$', tok[1]):
                tags = tok[3:]
                for nt in FIX[name].split():
                    core = nt.lstrip('-?').rstrip('?')
                    tags = [t for t in tags if t.lstrip('-?').rstrip('?') != core]
                    tags.append(nt)
                lines[i] = ' '.join(tok[:3] + tags); ch += 1
        open(p, 'w', encoding='utf8').write('\n'.join(lines))
        print(f, ch)
if __name__ == '__main__':
    import json; apply(json.load(open(sys.argv[1], encoding='utf8')))
