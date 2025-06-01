# 👻 Ghost-Themed Test Suite for SDT Manager

Welcome to our Pac-Man ghost-themed testing strategy! Each ghost represents a different testing domain, reflecting their unique personalities and behaviors from the classic game.

## 🧪 Test Structure Overview

### 👻 **Inky** (Blue Ghost) - `inky.test.ts`
**Personality**: Strategic, methodical, analytical
**Testing Domain**: Core data structures and utilities
**Focus Areas**:
- Dialog node creation and validation
- Dialog tree structure integrity  
- Project data validation
- Type safety and data integrity checks
- Schema validation

**Why Inky?** Inky is known for being strategic and calculating his moves based on other ghosts' positions. This makes him perfect for testing the foundational data structures that everything else depends on.

### 👻 **Blinky** (Red Ghost) - `blinky.test.tsx`  
**Personality**: Aggressive, direct, leadership-focused
**Testing Domain**: Character management system
**Focus Areas**:
- Character creation and editing
- CharacterModal component functionality
- Character validation and properties
- Voice profile management
- Color management and validation

**Why Blinky?** As the leader of the ghost pack, Blinky is aggressive and direct in his approach. This mirrors how character management needs to be robust and handle direct user interactions efficiently.

### 👻 **Pinky** (Pink Ghost) - `pinky.test.tsx`
**Personality**: Ambush-focused, unpredictable, UI-centric  
**Testing Domain**: UI components and user interactions
**Focus Areas**:
- Button, Input, Badge, Card components
- Label, Textarea, Select components
- Accessibility features
- Responsive behavior
- Edge cases and error states

**Why Pinky?** Pinky tries to ambush Pac-Man by positioning ahead of him, which requires understanding the environment. Similarly, UI components need to handle unexpected user behaviors and edge cases.

### 👻 **Clyde** (Orange Ghost) - `clyde.test.tsx`
**Personality**: Unpredictable, sometimes helpful, complex behavior
**Testing Domain**: Context and state management  
**Focus Areas**:
- DialogProjectContext functionality
- State mutations and updates
- Action dispatching
- Complex state scenarios
- Side effects and async behavior

**Why Clyde?** Clyde is the most unpredictable ghost, sometimes chasing and sometimes retreating. This unpredictability makes him perfect for testing complex state management scenarios where multiple actions can occur in various orders.

## 🎮 Running the Tests

### Run All Tests
```bash
npm test
```

### Run Specific Ghost Tests
```bash
# Test data structures (Inky)
npm test inky

# Test character management (Blinky)  
npm test blinky

# Test UI components (Pinky)
npm test pinky

# Test state management (Clyde)
npm test clyde
```

### Run Tests with UI
```bash
npm run test:ui
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

## 🧪 Testing Strategies by Ghost

### 🔵 Inky's Testing Strategy
- **Data Validation**: Ensures all data structures conform to TypeScript interfaces
- **Schema Testing**: Validates required vs optional properties
- **Edge Case Data**: Tests with minimal, maximal, and edge case data
- **Type Safety**: Ensures TypeScript compilation catches type errors

### 🔴 Blinky's Testing Strategy  
- **Component Integration**: Tests full component lifecycle
- **User Interaction**: Simulates real user behavior with userEvent
- **Form Validation**: Tests required fields and validation logic
- **State Synchronization**: Ensures UI state matches component state

### 🩷 Pinky's Testing Strategy
- **Component Isolation**: Tests each UI component independently
- **Accessibility Testing**: Ensures proper ARIA labels and keyboard navigation
- **Responsive Testing**: Validates behavior across different screen sizes
- **Error Boundary Testing**: Tests component behavior with invalid props

### 🟠 Clyde's Testing Strategy
- **State Machine Testing**: Tests all possible state transitions
- **Action Sequencing**: Tests actions in different orders
- **Side Effect Testing**: Validates timestamps, IDs, and derived state
- **Context Provider Testing**: Ensures proper provider behavior

## 📊 Test Coverage Goals

- **Inky**: 95%+ coverage on type definitions and utility functions
- **Blinky**: 90%+ coverage on character-related components and logic
- **Pinky**: 85%+ coverage on UI components with accessibility focus
- **Clyde**: 90%+ coverage on context and state management logic

## 🎯 Testing Philosophy

Our ghost-themed approach isn't just for fun—it helps organize tests by concern and makes the test suite more maintainable:

1. **Clear Separation**: Each ghost handles a distinct domain
2. **Personality-Driven**: Test strategies match the ghost's game behavior
3. **Memorable Organization**: Easy to remember which tests belong where
4. **Thematic Consistency**: All tests follow the same naming and structure conventions

## 🚨 Common Test Patterns

### Data Testing (Inky Style)
```typescript
it('should validate character color format', () => {
  const validColors = ['#ff0000', '#00ff00', '#0000ff']
  validColors.forEach(color => {
    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/)
  })
})
```

### Component Testing (Blinky/Pinky Style)
```typescript
it('should handle user interactions', async () => {
  const user = userEvent.setup()
  render(<Component />)
  
  await user.click(screen.getByRole('button'))
  expect(mockHandler).toHaveBeenCalled()
})
```

### State Testing (Clyde Style)
```typescript
it('should manage complex state transitions', () => {
  const { result } = renderHook(() => useContext(), { wrapper })
  
  act(() => {
    result.current.dispatch({ type: 'ACTION', payload: data })
  })
  
  expect(result.current.state).toMatchObject(expectedState)
})
```

---

*Remember: Like the ghosts in Pac-Man, our tests work together as a team to ensure the entire maze (application) runs smoothly!* 👻🎮
