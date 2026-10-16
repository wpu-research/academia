"""Konu anlatımı dizinini üretir: public/modules/matematik/anlatim/index.json.
Müfredat sırasıyla, yalnız dosyası olan konular. Kullanım: python3 -I tools/anlatim_index.py [--konular]"""
import json, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent / "public/modules/matematik"
cur = json.loads((root / "curriculum.json").read_text())
adir = root / "anlatim"
rows = []
for st in cur["asamalar"]:
    for g in st["siniflar"]:
        for t in g["temalar"]:
            for k in t["konular"]:
                rows.append({"id": k["id"], "baslik": k["baslik"], "sinif": f'{g["sinif"]}. sınıf', "asama": st["ad"], "tema": t["baslik"],
                             "kazanim": [x for x in k.get("kazanim", [])], "sim": k.get("sim"), "ders": k.get("ders")})
if "--konular" in sys.argv:
    print(json.dumps(rows, ensure_ascii=False, indent=1)); sys.exit()
have = [r for r in rows if (adir / f'{r["id"]}.json').exists()]
(adir / "index.json").write_text(json.dumps({"konular": [{"id": r["id"], "baslik": r["baslik"], "sinif": r["sinif"]} for r in have]}, ensure_ascii=False, indent=1))
print(f"{len(have)}/{len(rows)} konu anlatımı")
