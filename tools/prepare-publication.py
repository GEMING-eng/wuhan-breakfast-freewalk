"""Prepare a new, isolated public source snapshot from the validated handoff ZIP."""
from pathlib import Path
import hashlib
import json
import zipfile

root = Path(__file__).resolve().parents[1]
bundle = root.parent / '武汉绘本早市-v7-自由逛街完整交接-2026-10-03.zip'
target = root.parent / 'wuhan-breakfast-storybook-handoff-publish'
if target.exists():
    raise SystemExit('Publication directory already exists; inspect it rather than overwriting.')
target.mkdir()
with zipfile.ZipFile(bundle) as archive:
    assert archive.testzip() is None
    for entry in archive.infolist():
        rel = Path(entry.filename)
        if rel.parts[0] == 'dist' or rel.name == 'PACKAGE-MANIFEST.json':
            continue
        assert not rel.is_absolute() and '..' not in rel.parts
        assert not any(part in ('.git', 'node_modules') or part.startswith('.env') for part in rel.parts)
        destination = (target / rel).resolve()
        assert destination.is_relative_to(target.resolve())
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(archive.read(entry))
files = [p for p in target.rglob('*') if p.is_file()]
snapshot = {
    'sourceRepository': 'https://github.com/GEMING-eng/wuhan-breakfast-paper-stage',
    'sourceBaseCommit': '0a77313f54dd4f8a5ab5f53e497df6704cc8d7b1',
    'publicHandoffRepository': 'https://github.com/Zhu4143/wuhan-breakfast-storybook-handoff',
    'version': 'v7.0.0-handoff',
    'note': 'Independent source snapshot. Original repository and local working changes are preserved. Build output is included only in the full release ZIP.',
    'bundleSha256': hashlib.sha256(bundle.read_bytes()).hexdigest(),
    'files': [{'path': p.relative_to(target).as_posix(), 'bytes': p.stat().st_size, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(files)]
}
(target / 'PUBLICATION-SNAPSHOT.json').write_text(json.dumps(snapshot, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'target':str(target),'files':len(files)+1,'MiB':round(sum(p.stat().st_size for p in files)/1048576,2)},ensure_ascii=False))
