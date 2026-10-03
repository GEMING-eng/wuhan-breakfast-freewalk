"""Bundle source, generated art, preview and verification; exclude private/runtime files."""
from pathlib import Path
import hashlib
import json
import zipfile

root = Path(__file__).resolve().parents[1]
target = root.parent / '武汉绘本早市-v7-自由逛街完整交接-2026-10-03.zip'
directories = ['src', 'public', 'tests', 'tools', 'docs', 'dist']
names = ['package.json', 'package-lock.json', 'tsconfig.json', 'vite.config.ts', 'index.html', 'README.md', '.gitignore', 'Start-Preview.cmd', 'Start-Atelier.cmd', 'Start-Street.cmd', 'Start-Tour.cmd', 'START-HERE-绘本老街.md', 'START-HERE-纸景样板.md']
files = [root / name for name in names]
for name in directories:
    files.extend(p for p in (root / name).rglob('*') if p.is_file() and not any(x in p.parts for x in ['node_modules', '.git', '__pycache__']) and not p.name.startswith('.env') and p.suffix not in ['.zip', '.log', '.pyc', '.tsbuildinfo'])
manifest = [{'path': p.relative_to(root).as_posix(), 'bytes': p.stat().st_size, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(files)]
with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
    for p in files:
        archive.write(p, p.relative_to(root).as_posix())
    archive.writestr('PACKAGE-MANIFEST.json', json.dumps(manifest, ensure_ascii=False, indent=2))
with zipfile.ZipFile(target) as archive:
    assert archive.testzip() is None
    required = ['dist/index.html', 'src/street/MorningStreet.ts', 'src/street/ExploreExperience.tsx', 'src/street/exploreState.ts', 'src/street/FirstPersonWalk.ts', 'Start-Tour.cmd', 'public/assets/storybook/keeper-atlas.webp', 'public/assets/storybook/cover-v7.png', 'public/assets/storybook/doupi-interior-v7.png', 'public/assets/storybook/mianwo-interior-v7.png', 'docs/street/自由逛街-v7-交接.md', 'docs/street/给同学Codex-续做提示词-v7.md', 'docs/street/verification-explore/report.json', 'START-HERE-绘本老街.md']
    assert all(n in archive.namelist() for n in required)
checksum = hashlib.sha256(target.read_bytes()).hexdigest()
target.with_suffix('.sha256').write_text(checksum+'  '+target.name+'\n', encoding='utf-8')
print(json.dumps({'path':str(target),'files':len(files)+1,'MiB':round(target.stat().st_size/1048576,2),'sha256':checksum},ensure_ascii=False))
