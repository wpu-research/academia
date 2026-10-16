import sys, os
OUT=os.environ.get('LA_OUT','/tmp')
from playwright.sync_api import sync_playwright
ids=sys.argv[1].split(',') if len(sys.argv)>1 else ['m5-2-2']
shots='--shots' in sys.argv
with sync_playwright() as p:
    b=p.chromium.launch(); bad=[]
    for kid in ids:
        for w,sch in ([(1280,'light'),(390,'dark')] if shots else [(1280,'light')]):
            pg=b.new_page(viewport={'width':w,'height':900},color_scheme=sch); errs=[]
            pg.add_init_script("localStorage.setItem('academia:onboarding-skipped','1')")
            pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: m.type=='error' and 'ERR_FAILED' not in m.text and errs.append(m.text))
            pg.route('**/fonts.{googleapis,gstatic}.com/**', lambda r: r.abort())
            pg.goto(f'http://localhost:8766/#anlatim-matematik.{kid}', wait_until='domcontentloaded')
            try: pg.wait_for_selector('article.la',timeout=6000)
            except Exception: bad.append((kid,'yuklenmedi',errs)); pg.close(); continue
            nsim=pg.locator('.la-simbox').count(); empty=pg.locator('.la-simbox .lp-sim:empty').count()
            fail=pg.locator('.la-simbox:has-text("Simülasyon yüklenemedi")').count()
            sw=pg.evaluate('document.documentElement.scrollWidth')
            if errs or nsim==0 or empty or fail or sw>w: bad.append((kid,w,dict(nsim=nsim,empty=empty,fail=fail,sw=sw,errs=errs[:3])))
            if shots: pg.screenshot(path=f'{OUT}/la-{kid}-{w}.png',full_page=True)
            pg.close()
    print('SORUNLU:',bad if bad else 'yok', '| kontrol edilen:',len(ids))
    b.close()
