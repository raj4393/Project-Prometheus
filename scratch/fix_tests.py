import re

with open('src/tests/deterministicEngine.spec.ts', 'r', encoding='utf-8') as f:
    code = f.read()

code = re.sub(r'SkillTag\.([A-Za-z]+)', r"'\1'", code)

with open('src/tests/deterministicEngine.spec.ts', 'w', encoding='utf-8') as f:
    f.write(code)
