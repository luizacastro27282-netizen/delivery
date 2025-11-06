# 🤝 Guia de Contribuição

Obrigado por considerar contribuir para o Pizza Delivery! 

## Como Contribuir

### 1. Fork e Clone

```bash
git clone https://github.com/seu-usuario/delivery.git
cd delivery
npm install
```

### 2. Crie uma Branch

```bash
git checkout -b feature/sua-feature
# ou
git checkout -b fix/seu-bugfix
```

### 3. Faça suas Alterações

- Escreva código limpo e bem documentado
- Siga as convenções de código do projeto
- Adicione testes se aplicável
- Atualize a documentação

### 4. Commit

Use mensagens descritivas:

```bash
git commit -m "feat: adiciona nova funcionalidade X"
git commit -m "fix: corrige bug Y"
git commit -m "docs: atualiza README"
```

### 5. Push e Pull Request

```bash
git push origin feature/sua-feature
```

Abra um Pull Request descrevendo suas alterações.

## Convenções de Código

### TypeScript

- Use TypeScript strict mode
- Defina tipos explícitos
- Evite `any` sempre que possível

### React

- Use componentes funcionais
- Hooks para lógica
- Props tipadas com interfaces

### Estilo

- Use Tailwind CSS
- Siga o padrão de nomenclatura existente
- Mantenha componentes pequenos e reutilizáveis

## Estrutura de Commits

Siga o padrão Conventional Commits:

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

## Testes

```bash
npm run test
```

## Linting

```bash
npm run lint
```

## Perguntas?

Abra uma issue para discussão!

---

**Obrigado pela contribuição! 🙏**

