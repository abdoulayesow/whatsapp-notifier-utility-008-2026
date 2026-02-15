# Refactoring Triggers

When to refactor and what to look for.

## Size Triggers

- [ ] **File > 200 lines** → Split into focused modules
- [ ] **Function > 30 lines** → Break into smaller functions
- [ ] **Class > 300 lines** → Extract helper class or utilities

## Complexity Triggers

- [ ] **Function > 3 parameters** → Use an options object
- [ ] **Nested ternaries > 2 levels** → Use early returns or lookup
- [ ] **Boolean flag parameter** → Split into two functions

## Duplication Triggers

- [ ] **Same logic in 2+ places** → Extract to shared utility
- [ ] **Same validation pattern** → Create a validator function
- [ ] **Same error handling** → Extract to helper

## API Design Triggers

- [ ] **Breaking change needed** → Consider adding new method instead
- [ ] **Optional param creep (>3 optional)** → Use options object
- [ ] **Return type growing** → Consider separate methods

## Import Triggers

- [ ] **Circular imports** → Restructure module boundaries
- [ ] **Importing internal implementation details** → Only import from public API
