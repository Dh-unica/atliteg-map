# Contributing to AtLiTeG Lemmario Dashboard

Thank you for your interest in contributing to the AtLiTeG Lemmario Dashboard project! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of experience level, background, or identity.

### Expected Behavior

- Be respectful and constructive in communication
- Accept feedback gracefully
- Focus on what is best for the project
- Show empathy towards other contributors

### Unacceptable Behavior

- Harassment, trolling, or discriminatory language
- Personal attacks or insults
- Publishing others' private information
- Other conduct that could reasonably be considered inappropriate

## Getting Started

### Prerequisites

- **Node.js**: v20.0.0 or higher
- **npm**: v10.0.0 or higher
- **Docker**: v20.10.0 or higher (for containerized development)
- **Git**: v2.30.0 or higher

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR-USERNAME/atliteg-map.git
cd atliteg-map/Lemmario_figma
```

3. Add upstream remote:

```bash
git remote add upstream https://github.com/ORIGINAL-OWNER/atliteg-map.git
```

### Install Dependencies

```bash
npm ci --legacy-peer-deps
```

### Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Development Workflow

### Prerequisites

```bash
# Verifica Node.js 20+
node --version  # v20.x.x

# Installa dipendenze (first time)
cd lemmario-dashboard
npm install
```

### Local Dev (Next.js 16)

```bash
cd lemmario-dashboard

# Start dev server
npm run dev  # http://localhost:3000

# Hot reload automatico con Turbopack
```

### Branch Naming Convention

**Follow gitflow**:
- `feat/description` - New features
- `fix/description` - Bug fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation
- `chore/description` - Maintenance
- `fix/short-description` - Bug fixes
- `docs/short-description` - Documentation changes
- `refactor/short-description` - Code refactoring
- `test/short-description` - Test additions/changes
- `chore/short-description` - Maintenance tasks

**Example**: `feature/add-export-functionality`

### Workflow Steps

1. **Create a branch** from `main`:

```bash
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name
```

2. **Make your changes** following coding standards

3. **Test your changes** locally:

```bash
npm run build
npm run preview
```

4. **Commit your changes** following commit guidelines

5. **Push to your fork**:

```bash
git push origin feature/your-feature-name
```

6. **Open a Pull Request** on GitHub

### Keeping Your Fork Updated

```bash
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

## Coding Standards

### TypeScript

- **Use TypeScript** for all new code
- **Enable strict mode** in `tsconfig.json`
- **Define interfaces** for all data structures
- **Avoid `any`** type; use `unknown` if type is truly unknown
- **Document complex types** with JSDoc comments

**Example**:

```typescript
/**
 * Represents a lemma from the AtLiTeG dataset
 */
interface Lemma {
  IdLemma: number;
  Lemma: string;
  Forma: string;
  // ... other fields
}

// Good
function processLemma(lemma: Lemma): void {
  // ...
}

// Bad - avoid `any`
function processLemma(lemma: any): void {
  // ...
}
```

### React Components

- **Functional components** with hooks (no class components)
- **One component per file** (except small helper components)
- **Props interface** defined above component
- **Use `React.memo`** for performance-critical components
- **Destructure props** in function signature

**Example**:

```typescript
interface SearchBarProps {
  lemmas: Lemma[];
  onSelect: (lemma: Lemma) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ lemmas, onSelect }) => {
  // Component implementation
};
```

### Custom Hooks

- **Prefix with `use`** (e.g., `useFilteredData`)
- **Single responsibility** - one concern per hook
- **Memoize expensive calculations** with `useMemo`
- **Document parameters and return value**

**Example**:

```typescript
/**
 * Filters lemmas based on current filter state
 * @param lemmas - Array of all lemmas
 * @param filters - Current filter state
 * @returns Array of filtered lemmas
 */
function useFilteredData(lemmas: Lemma[], filters: FilterState): Lemma[] {
  return useMemo(() => {
    // Filtering logic
  }, [lemmas, filters]);
}
```

### Styling

- **Tailwind CSS** utility classes for styling
- **Avoid inline styles** unless dynamic
- **Use CSS variables** for theme colors (defined in `globals.css`)
- **Follow existing patterns** for consistency

**Example**:

```tsx
// Good
<div className="flex items-center gap-2 rounded-md bg-primary px-4 py-2">
  {/* Content */}
</div>

// Avoid
<div style={{ display: 'flex', padding: '8px 16px' }}>
  {/* Content */}
</div>
```

### File Organization

```
src/
├── components/       # React components
│   ├── ui/          # Reusable UI primitives (Radix)
│   └── ...          # Feature components
├── hooks/           # Custom React hooks
├── services/        # Business logic, data fetching
├── utils/           # Pure utility functions
├── context/         # React Context providers
├── types/           # TypeScript type definitions
└── styles/          # Global styles
```

### Naming Conventions

- **Files**: `camelCase.tsx` for components, `camelCase.ts` for utilities
- **Components**: `PascalCase` (e.g., `SearchBar.tsx`)
- **Hooks**: `camelCase` with `use` prefix (e.g., `useFilteredData.ts`)
- **Utils**: `camelCase` (e.g., `categoryParser.ts`)
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces**: `PascalCase` (e.g., `Lemma`, `FilterState`)

## Commit Guidelines

### Conventional Commits

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring (no feature change)
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, tooling
- `ci`: CI/CD configuration changes

### Scope (Optional)

- `filters` - Filters component
- `map` - Geographical map
- `timeline` - Timeline component
- `search` - Search functionality
- `hooks` - Custom hooks
- `docs` - Documentation
- `docker` - Docker configuration

### Examples

```bash
# Feature
git commit -m "feat(filters): add multi-select for categories"

# Bug fix
git commit -m "fix(map): correct marker clustering on zoom"

# Documentation
git commit -m "docs: update deployment guide with Nginx config"

# Refactoring
git commit -m "refactor(hooks): extract filtering logic to useFilteredData"

# Performance
git commit -m "perf(timeline): memoize year calculation"

# Breaking change
git commit -m "feat(api): change Lemma interface structure

BREAKING CHANGE: Lemma.Categoria is now an array instead of string"
```

### Commit Message Guidelines

- **Use present tense**: "add feature" not "added feature"
- **Use imperative mood**: "move cursor to..." not "moves cursor to..."
- **Keep subject line ≤ 50 characters**
- **Separate subject from body** with blank line
- **Wrap body at 72 characters**
- **Reference issues** in footer: `Fixes #123`

## Pull Request Process

### Before Submitting

1. **Ensure code builds** without errors:

```bash
npm run build
```

2. **Run linter** and fix issues:

```bash
npm run lint
npm run lint:fix
```

3. **Format code**:

```bash
npm run format
```

4. **Test locally** (when tests are implemented):

```bash
npm test
```

5. **Update documentation** if needed

6. **Update CHANGELOG.md** for significant changes

### PR Title

Follow the same format as commits:

```
feat(filters): add export functionality
```

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues

Fixes #123

## Testing

- [ ] Tested locally with dev server
- [ ] Tested production build
- [ ] Tested on mobile viewport
- [ ] Accessibility tested (keyboard nav, screen reader)

## Screenshots (if applicable)

[Add screenshots]

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review performed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated (if applicable)
```

### Review Process

1. **At least one approval** required from maintainers
2. **CI checks must pass** (when implemented)
3. **Address review feedback** in new commits (don't force-push)
4. **Squash commits** before merge (maintainers will do this)

### After Merge

- Delete your feature branch on GitHub and locally:

```bash
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

## Testing

### Unit Tests (When Implemented)

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- useFilteredData.test.ts

# Watch mode
npm run test:watch
```

### E2E Tests (When Implemented)

```bash
# Run E2E tests
npm run test:e2e

# Run specific test
npm run test:e2e -- search.spec.ts
```

### Manual Testing Checklist

Before submitting PR, verify:

- [ ] Filters work correctly (categoria, periodo)
- [ ] Search autocomplete functions
- [ ] Map displays markers after filtering
- [ ] Timeline year selection works
- [ ] Alphabetical index filters correctly
- [ ] Lemma detail panel opens with correct info
- [ ] Metrics update when filters change
- [ ] Reset filters button works
- [ ] Keyboard navigation works
- [ ] Responsive design on mobile
- [ ] No console errors

## Documentation

### Code Comments

- **JSDoc comments** for public functions/interfaces
- **Inline comments** for complex logic only
- **Avoid obvious comments** (code should be self-explanatory)

**Example**:

```typescript
/**
 * Filters lemmas by multiple categories using OR logic
 * @param lemma - The lemma to check
 * @param categories - Array of categories to match
 * @returns true if lemma has at least one category
 */
export function lemmaHasAnyCategory(lemma: Lemma, categories: string[]): boolean {
  if (categories.length === 0) return true;
  
  const lemmaCategories = parseCategories(lemma.Categoria);
  return categories.some(cat => lemmaCategories.includes(cat));
}
```

### Documentation Updates

When adding/changing features, update:

- **README.md** - If setup/usage changes
- **ARCHITECTURE.md** - If architecture changes
- **USER_GUIDE.md** - If user-facing features change
- **API_REFERENCE.md** - If internal APIs change
- **DEPLOYMENT_GUIDE.md** - If deployment process changes
- **CHANGELOG.md** - For all notable changes

## Reporting Issues

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check documentation** for answers
3. **Update to latest version** to see if issue persists

### Bug Reports

Use the bug report template with:

- **Clear title**: "Map markers not appearing after category filter"
- **Environment**: Browser, OS, Node version, npm version
- **Steps to reproduce**: Numbered list
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable
- **Console errors**: From browser DevTools

**Example**:

```markdown
**Title**: Map markers not appearing after category filter

**Environment**:
- Browser: Chrome 120
- OS: Ubuntu 22.04
- Node: v20.10.0
- npm: 10.2.0

**Steps to Reproduce**:
1. Open application
2. Click "Categoria" filter
3. Select "Dolci"
4. Observe map

**Expected**: Map shows markers for all "Dolci" lemmas

**Actual**: Map remains empty, no markers visible

**Console Errors**:
```
TypeError: Cannot read property 'lat' of undefined
  at GeographicalMap.tsx:45
```

**Screenshots**: [Attach screenshot]
```

### Feature Requests

Include:

- **Clear description** of feature
- **Use case**: Why is this needed?
- **Proposed solution**: How should it work?
- **Alternatives considered**: Other approaches

### Questions

- Use [GitHub Discussions](https://github.com/your-org/atliteg-map/discussions) for questions
- Check existing discussions first

## Development Tips

### Debugging

**React DevTools**:
```bash
# Install browser extension
# Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/...
```

**Console Logging**:
```typescript
// Use DEBUG prefix for debug logs
console.log('[DEBUG] Filtered lemmas:', filteredLemmas.length);

// Remove debug logs before committing
```

**Source Maps**:
- Production build includes source maps for debugging
- Use browser DevTools Sources panel

### Performance Profiling

```typescript
// Use React DevTools Profiler
// Record interactions and analyze render times

// Console timing
console.time('filterLemmas');
const filtered = filterLemmas(lemmas, filters);
console.timeEnd('filterLemmas');
```

### Accessibility Testing

**Keyboard Navigation**:
- Tab through all interactive elements
- Enter/Space activate buttons
- Escape closes modals
- Arrow keys navigate lists

**Screen Reader**:
- Test with NVDA (Windows), JAWS, or VoiceOver (Mac)
- Ensure all images have alt text
- Verify ARIA labels are descriptive

**Automated**:
```bash
# Install axe DevTools browser extension
# Run accessibility audit in DevTools
```

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)
- [Leaflet Documentation](https://leafletjs.com/reference.html)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see [LICENSE](../LICENSE) file).

## Questions?

- **GitHub Discussions**: [Ask here](https://github.com/your-org/atliteg-map/discussions)
- **Email**: maintainers@atliteg.example.com

Thank you for contributing! 🎉
