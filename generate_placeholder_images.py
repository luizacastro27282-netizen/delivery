#!/usr/bin/env python3
"""Gera imagens SVG placeholder para todos os produtos"""

import os

# Definições de produtos e suas cores
products = {
    'pizzas': [
        ('calabresa', '#dc2626', '🍕'),
        ('mussarela', '#fbbf24', '🧀'),
        ('frango-catupiry', '#f59e0b', '🐔'),
        ('portuguesa', '#ef4444', '🍅'),
        ('4queijos', '#fcd34d', '🧀'),
        ('2sabores', '#f97316', '🍕'),
    ],
    'bebidas': [
        ('coca-lata', '#dc2626', '🥤'),
        ('guarana-lata', '#10b981', '🥤'),
        ('coca-2l', '#b91c1c', '🥤'),
        ('suco-laranja', '#f59e0b', '🍊'),
    ],
    'sobremesas': [
        ('pudim', '#fbbf24', '🍮'),
        ('petit-gateau', '#78350f', '🍫'),
    ],
    'combos': [
        ('famiglia', '#ef4444', '🍕'),
        ('casal', '#f97316', '🍕'),
        ('festa', '#dc2626', '🎉'),
    ]
}

svg_template = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <defs>
    <linearGradient id="grad-{name}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:{color};stop-opacity:0.7" />
    </linearGradient>
  </defs>
  <rect width="300" height="300" fill="#f3f4f6"/>
  <circle cx="150" cy="130" r="100" fill="url(#grad-{name})"/>
  <text x="150" y="150" font-size="60" text-anchor="middle">{emoji}</text>
  <text x="150" y="270" font-size="18" text-anchor="middle" fill="#374151" font-weight="bold">{title}</text>
</svg>'''

# Criar diretórios
base_path = 'public/images'
for category in products.keys():
    os.makedirs(f'{base_path}/{category}', exist_ok=True)

# Gerar SVGs
for category, items in products.items():
    for name, color, emoji in items:
        svg_content = svg_template.format(
            name=name,
            color=color,
            emoji=emoji,
            title=name.replace('-', ' ').title()
        )
        
        filepath = f'{base_path}/{category}/{name}.svg'
        with open(filepath, 'w') as f:
            f.write(svg_content)
        
        print(f'✅ Criado: {filepath}')

print('\n🎉 Todas as imagens placeholder foram criadas com sucesso!')

