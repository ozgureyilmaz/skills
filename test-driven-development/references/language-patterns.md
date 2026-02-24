# Language-Specific TDD Patterns

## Table of Contents

- [Python](#python)
- [JavaScript / TypeScript](#javascript--typescript)
- [Rust](#rust)
- [Go](#go)
- [Solidity](#solidity)
- [Java](#java)

---

## Python

### Framework: `pytest`

**Setup:**
```bash
pip install pytest pytest-cov
```

**Project structure:**
```
project/
├── src/
│   └── calculator.py
└── tests/
    ├── conftest.py        # shared fixtures
    └── test_calculator.py
```

**Test example:**
```python
# tests/test_calculator.py
import pytest
from src.calculator import Calculator

class TestCalculatorAdd:
    def test_add_two_positive_numbers(self):
        calc = Calculator()
        assert calc.add(2, 3) == 5

    def test_add_negative_numbers(self):
        calc = Calculator()
        assert calc.add(-1, -1) == -2

    def test_add_zero(self):
        calc = Calculator()
        assert calc.add(5, 0) == 5

    def test_add_raises_on_non_numeric(self):
        calc = Calculator()
        with pytest.raises(TypeError):
            calc.add("a", 1)
```

**Run commands:**
```bash
pytest                          # run all tests
pytest tests/test_calculator.py # run specific file
pytest -x                       # stop on first failure (good for TDD)
pytest -v                       # verbose output
pytest --cov=src                # with coverage report
pytest -k "test_add"            # run tests matching pattern
```

**Fixtures for test isolation:**
```python
@pytest.fixture
def calculator():
    return Calculator()

def test_add(calculator):
    assert calculator.add(2, 3) == 5
```

**Mocking:**
```python
from unittest.mock import Mock, patch

@patch("src.service.external_api")
def test_fetches_data(mock_api):
    mock_api.return_value = {"status": "ok"}
    result = service.fetch()
    assert result["status"] == "ok"
    mock_api.assert_called_once()
```

---

## JavaScript / TypeScript

### Framework: `vitest` (preferred) or `jest`

**Setup (Vitest):**
```bash
npm install -D vitest
```

**`package.json`:**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

**Project structure:**
```
project/
├── src/
│   └── calculator.ts
└── tests/
    └── calculator.test.ts
```

**Test example:**
```typescript
// tests/calculator.test.ts
import { describe, it, expect } from 'vitest';
import { Calculator } from '../src/calculator';

describe('Calculator.add', () => {
  it('adds two positive numbers', () => {
    const calc = new Calculator();
    expect(calc.add(2, 3)).toBe(5);
  });

  it('adds negative numbers', () => {
    const calc = new Calculator();
    expect(calc.add(-1, -1)).toBe(-2);
  });

  it('throws on non-numeric input', () => {
    const calc = new Calculator();
    expect(() => calc.add('a' as any, 1)).toThrow(TypeError);
  });
});
```

**Run commands:**
```bash
npx vitest run              # run all tests once
npx vitest                  # watch mode (great for TDD)
npx vitest run --reporter=verbose
npx vitest run --coverage   # with coverage
```

**Mocking:**
```typescript
import { vi, describe, it, expect } from 'vitest';

vi.mock('../src/api', () => ({
  fetchData: vi.fn().mockResolvedValue({ status: 'ok' }),
}));
```

---

## Rust

### Framework: built-in `#[cfg(test)]`

**Test structure (in same file or `tests/` directory):**
```
project/
├── src/
│   └── lib.rs         # unit tests inline
└── tests/
    └── integration.rs # integration tests
```

**Unit test example:**
```rust
// src/calculator.rs
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn adds_two_positive_numbers() {
        assert_eq!(add(2, 3), 5);
    }

    #[test]
    fn adds_negative_numbers() {
        assert_eq!(add(-1, -1), -2);
    }

    #[test]
    #[should_panic(expected = "overflow")]
    fn panics_on_overflow() {
        add(i32::MAX, 1);
    }
}
```

**Run commands:**
```bash
cargo test                        # run all tests
cargo test -- --nocapture         # show println! output
cargo test adds_two               # run matching tests
cargo test -- --test-threads=1    # sequential execution
```

---

## Go

### Framework: built-in `testing`

**Project structure:**
```
project/
├── calculator.go
└── calculator_test.go     # test file lives alongside source
```

**Test example:**
```go
// calculator_test.go
package calculator

import "testing"

func TestAdd_TwoPositiveNumbers(t *testing.T) {
    got := Add(2, 3)
    want := 5
    if got != want {
        t.Errorf("Add(2, 3) = %d, want %d", got, want)
    }
}

func TestAdd_NegativeNumbers(t *testing.T) {
    got := Add(-1, -1)
    want := -2
    if got != want {
        t.Errorf("Add(-1, -1) = %d, want %d", got, want)
    }
}
```

**Table-driven tests (idiomatic Go TDD):**
```go
func TestAdd(t *testing.T) {
    tests := []struct {
        name string
        a, b int
        want int
    }{
        {"positive numbers", 2, 3, 5},
        {"negative numbers", -1, -1, -2},
        {"zero", 5, 0, 5},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got := Add(tt.a, tt.b)
            if got != tt.want {
                t.Errorf("Add(%d, %d) = %d, want %d", tt.a, tt.b, got, tt.want)
            }
        })
    }
}
```

**Run commands:**
```bash
go test ./...              # all tests
go test -v ./...           # verbose
go test -run TestAdd       # specific test
go test -count=1 ./...     # disable cache
go test -cover ./...       # coverage
```

---

## Solidity

### Framework: Foundry (Forge)

**Project structure:**
```
project/
├── src/
│   └── Token.sol
└── test/
    └── Token.t.sol
```

**Test example:**
```solidity
// test/Token.t.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Token.sol";

contract TokenTest is Test {
    Token token;
    address alice = makeAddr("alice");

    function setUp() public {
        token = new Token("Test", "TST", 1000e18);
    }

    function test_InitialSupply() public view {
        assertEq(token.totalSupply(), 1000e18);
    }

    function test_Transfer() public {
        token.transfer(alice, 100e18);
        assertEq(token.balanceOf(alice), 100e18);
    }

    function testFail_TransferInsufficientBalance() public {
        vm.prank(alice);
        token.transfer(address(this), 1); // alice has 0 tokens
    }

    function testFuzz_Transfer(uint256 amount) public {
        amount = bound(amount, 0, token.balanceOf(address(this)));
        token.transfer(alice, amount);
        assertEq(token.balanceOf(alice), amount);
    }
}
```

**Run commands:**
```bash
forge test                    # run all tests
forge test -vvvv              # max verbosity (traces)
forge test --match-test test_Transfer
forge test --gas-report       # gas profiling
forge coverage                # coverage report
```

---

## Java

### Framework: JUnit 5

**Project structure (Maven):**
```
project/
├── src/
│   └── main/java/com/example/Calculator.java
└── src/
    └── test/java/com/example/CalculatorTest.java
```

**Test example:**
```java
// src/test/java/com/example/CalculatorTest.java
package com.example;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import static org.junit.jupiter.api.Assertions.*;

class CalculatorTest {

    @Test
    @DisplayName("adds two positive numbers")
    void addsTwoPositiveNumbers() {
        Calculator calc = new Calculator();
        assertEquals(5, calc.add(2, 3));
    }

    @Test
    @DisplayName("adds negative numbers")
    void addsNegativeNumbers() {
        Calculator calc = new Calculator();
        assertEquals(-2, calc.add(-1, -1));
    }

    @Test
    @DisplayName("throws on null input")
    void throwsOnNullInput() {
        Calculator calc = new Calculator();
        assertThrows(NullPointerException.class, () -> calc.add(null, 1));
    }
}
```

**Run commands:**
```bash
mvn test                              # Maven
gradle test                           # Gradle
mvn test -Dtest=CalculatorTest        # specific test class
mvn test -Dtest=CalculatorTest#addsTwoPositiveNumbers  # specific method
```
