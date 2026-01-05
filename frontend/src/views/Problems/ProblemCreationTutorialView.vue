<template>
  <Card>
    <template #title>
      <div class="flex align-items-center justify-content-between w-full">
        <h2>Problem Creation Tutorial</h2>
        <Button class="p-button-text" label="Back" icon="pi pi-angle-left" @click="goHome" />
      </div>
    </template>
    <template #content>
      <div class="tutorial-content">
        <!-- Introduction Section -->
        <div class="mb-5">
          <h3 class="mb-3">Introduction</h3>
          <p class="text-lg line-height-3 mb-3">
            When creating problems in JarCode, you need to provide two essential pieces of code:
          </p>
          <ul class="list-disc ml-4 mb-3">
            <li class="mb-2">
              <strong>Starting Code:</strong> The initial code template that students will see and
              modify. This should include function/class signatures and any necessary boilerplate.
            </li>
            <li class="mb-2">
              <strong>Test Code:</strong> The test suite that will be used to evaluate student
              submissions. This code must follow specific format requirements depending on the
              programming language.
            </li>
          </ul>
          <p class="text-lg line-height-3">
            The evaluation system runs your test code against the student's solution in an isolated
            Docker container. Understanding the correct format for each language is crucial for
            creating effective problems.
          </p>
        </div>

        <!-- Language Sections -->
        <Accordion :active-index="0" class="mb-4">
          <!-- Python Section -->
          <AccordionTab>
            <template #header>
              <div class="flex align-items-center gap-2">
                <i class="pi pi-code"></i>
                <span class="font-semibold">Python</span>
              </div>
            </template>
            <div class="py-3">
              <h4 class="mb-3">How Python Evaluation Works</h4>
              <p class="mb-3">
                Python problems use the <strong>pytest</strong> framework. The system writes your
                solution code to <code>solution.py</code> and your test code to
                <code>test.py</code>, then runs <code>pytest</code> on the test file.
              </p>

              <h5 class="mb-2 mt-4">Starting Code Format</h5>
              <p class="mb-3">
                The starting code should define the functions or classes that students need to
                implement. Functions should be properly defined with signatures.
              </p>
              <div class="mb-4">
                <label class="block mb-2 font-semibold">Example Starting Code:</label>
                <MonacoCodeEditor
                  :model-value="pythonStartingCode"
                  language="PYTHON"
                  :read-only="true"
                  :height="150"
                />
              </div>

              <h5 class="mb-2 mt-4">Test Code Format</h5>
              <p class="mb-3">
                Test code must import from the <code>solution</code> module and use pytest's test
                function format. Each test should be a function starting with <code>test_</code>.
              </p>
              <div class="mb-4">
                <label class="block mb-2 font-semibold">Example Test Code:</label>
                <MonacoCodeEditor
                  :model-value="pythonTestCode"
                  language="PYTHON"
                  :read-only="true"
                  :height="200"
                />
              </div>

              <h5 class="mb-2 mt-4">Important Notes</h5>
              <ul class="list-disc ml-4 mb-3">
                <li>
                  Always import from <code>solution</code> module:
                  <code>from solution import function_name</code>
                </li>
                <li>Test functions must start with <code>test_</code> prefix</li>
                <li>Use standard Python assertions: <code>assert condition</code></li>
                <li>You can have multiple test functions in the same test file</li>
                <li>Tests are executed with <code>pytest -q --tb=short</code></li>
              </ul>
            </div>
          </AccordionTab>

          <!-- Java Section -->
          <AccordionTab>
            <template #header>
              <div class="flex align-items-center gap-2">
                <i class="pi pi-code"></i>
                <span class="font-semibold">Java</span>
              </div>
            </template>
            <div class="py-3">
              <h4 class="mb-3">How Java Evaluation Works</h4>
              <p class="mb-3">
                Java problems use the <strong>JUnit 5</strong> framework. The system writes your
                solution code to <code>Solution.java</code> and your test code to
                <code>SolutionTest.java</code>, then compiles and runs the tests using JUnit
                Platform Console Standalone.
              </p>

              <h5 class="mb-2 mt-4">Starting Code Format</h5>
              <p class="mb-3">
                The starting code must be in a class named <strong>Solution</strong>. This is a hard
                requirement - the class name must be exactly <code>Solution</code>.
              </p>
              <div class="mb-4">
                <label class="block mb-2 font-semibold">Example Starting Code:</label>
                <MonacoCodeEditor
                  :model-value="javaStartingCode"
                  language="JAVA"
                  :read-only="true"
                  :height="200"
                />
              </div>

              <h5 class="mb-2 mt-4">Test Code Format</h5>
              <p class="mb-3">
                Test code must be in a class named <strong>SolutionTest</strong> and use JUnit 5
                annotations. Import JUnit assertions and use <code>@Test</code> annotation for each
                test method.
              </p>
              <div class="mb-4">
                <label class="block mb-2 font-semibold">Example Test Code:</label>
                <MonacoCodeEditor
                  :model-value="javaTestCode"
                  language="JAVA"
                  :read-only="true"
                  :height="250"
                />
              </div>

              <h5 class="mb-2 mt-4">Important Notes</h5>
              <ul class="list-disc ml-4 mb-3">
                <li>Solution class must be named exactly <code>Solution</code></li>
                <li>Test class must be named exactly <code>SolutionTest</code></li>
                <li>Use JUnit 5 annotations: <code>@Test</code> for test methods</li>
                <li>
                  Import assertions: <code>import static org.junit.jupiter.api.Assertions.*;</code>
                </li>
                <li>Compilation errors will result in <code>COMPILATION_ERROR</code> outcome</li>
                <li>Tests are executed with JUnit Platform Console Standalone</li>
              </ul>
            </div>
          </AccordionTab>

          <!-- C++ Section -->
          <AccordionTab>
            <template #header>
              <div class="flex align-items-center gap-2">
                <i class="pi pi-code"></i>
                <span class="font-semibold">C++</span>
              </div>
            </template>
            <div class="py-3">
              <h4 class="mb-3">How C++ Evaluation Works</h4>
              <p class="mb-3">
                C++ problems use the <strong>Catch2</strong> testing framework. The system writes
                your solution code to <code>solution.cpp</code> and your test code to
                <code>test.cpp</code>, then compiles them together and runs the test executable.
              </p>

              <h5 class="mb-2 mt-4">Starting Code Format</h5>
              <p class="mb-3">
                The starting code should define the functions that students need to implement.
                Functions can be standalone (not in a class) or part of a class, depending on your
                problem design.
              </p>
              <div class="mb-4">
                <label class="block mb-2 font-semibold">Example Starting Code:</label>
                <MonacoCodeEditor
                  :model-value="cppStartingCode"
                  language="CPP"
                  :read-only="true"
                  :height="150"
                />
              </div>

              <h5 class="mb-2 mt-4">Test Code Format</h5>
              <p class="mb-3">
                Test code must include the Catch2 header and include your solution file. Use
                <code>TEST_CASE</code> macro to define test cases and <code>REQUIRE</code> for
                assertions.
              </p>
              <div class="mb-4">
                <label class="block mb-2 font-semibold">Example Test Code:</label>
                <MonacoCodeEditor
                  :model-value="cppTestCode"
                  language="CPP"
                  :read-only="true"
                  :height="200"
                />
              </div>

              <h5 class="mb-2 mt-4">Important Notes</h5>
              <ul class="list-disc ml-4 mb-3">
                <li>
                  Must include Catch2: <code>#include &lt;catch2/catch_test_macros.hpp&gt;</code>
                </li>
                <li>Must include solution: <code>#include "solution.cpp"</code></li>
                <li>Use <code>TEST_CASE("Description", "[tag]")</code> macro for test cases</li>
                <li>Use <code>REQUIRE(condition)</code> for assertions</li>
                <li>Code is compiled with: <code>g++ -std=c++20 -O2</code></li>
                <li>Compilation errors will result in <code>COMPILATION_ERROR</code> outcome</li>
                <li>Tests are executed by running the compiled executable</li>
              </ul>
            </div>
          </AccordionTab>
        </Accordion>

        <!-- Best Practices Section -->
        <div class="mt-5">
          <h3 class="mb-3">Best Practices</h3>
          <ul class="list-disc ml-4 mb-3">
            <li class="mb-2">
              <strong>Test Coverage:</strong> Write comprehensive tests that cover edge cases,
              boundary conditions, and typical use cases.
            </li>
            <li class="mb-2">
              <strong>Clear Starting Code:</strong> Provide meaningful function/class names and
              clear parameter names to guide students.
            </li>
            <li class="mb-2">
              <strong>Descriptive Test Names:</strong> Use descriptive test case names and
              assertions that clearly indicate what is being tested.
            </li>
            <li class="mb-2">
              <strong>Error Messages:</strong> Consider how test failures will appear to students -
              clear assertion messages help with debugging.
            </li>
            <li class="mb-2">
              <strong>Test Your Tests:</strong> Before publishing a problem, verify that your test
              code correctly passes a valid solution and fails an invalid one.
            </li>
          </ul>
        </div>

        <!-- Common Pitfalls Section -->
        <div class="mt-5">
          <h3 class="mb-3">Common Pitfalls</h3>
          <ul class="list-disc ml-4 mb-3">
            <li class="mb-2">
              <strong>Python:</strong> Forgetting to import from <code>solution</code> module or
              using incorrect import syntax.
            </li>
            <li class="mb-2">
              <strong>Java:</strong> Using incorrect class names (<code>Solution</code> and
              <code>SolutionTest</code> are required) or missing JUnit imports.
            </li>
            <li class="mb-2">
              <strong>C++:</strong> Missing Catch2 includes or incorrect include syntax for solution
              file.
            </li>
            <li class="mb-2">
              <strong>All Languages:</strong> Test code that doesn't compile or has syntax errors
              will cause evaluation failures.
            </li>
            <li class="mb-2">
              <strong>All Languages:</strong> Infinite loops or very slow code may timeout (30
              seconds per language).
            </li>
          </ul>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { useRouter } from 'vue-router';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import MonacoCodeEditor from '../../components/editors/MonacoCodeEditor.vue';

const router = useRouter();

const goHome = () => router.push({ name: 'home' });

// Python examples
const pythonStartingCode = `def add(a, b):
    # TODO: Implement this function
    pass`;

const pythonTestCode = `from solution import add

def test_add_positive_numbers():
    assert add(1, 2) == 3

def test_add_negative_numbers():
    assert add(-1, -2) == -3

def test_add_zero():
    assert add(0, 5) == 5
    assert add(5, 0) == 5`;

// Java examples
const javaStartingCode = `public class Solution {
    public int add(int a, int b) {
        // TODO: Implement this method
        return 0;
    }
}`;

const javaTestCode = `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class SolutionTest {
    @Test
    public void testAddPositiveNumbers() {
        Solution s = new Solution();
        assertEquals(3, s.add(1, 2));
    }

    @Test
    public void testAddNegativeNumbers() {
        Solution s = new Solution();
        assertEquals(-3, s.add(-1, -2));
    }

    @Test
    public void testAddZero() {
        Solution s = new Solution();
        assertEquals(5, s.add(0, 5));
        assertEquals(5, s.add(5, 0));
    }
}`;

// C++ examples
const cppStartingCode = `int add(int a, int b) {
    // TODO: Implement this function
    return 0;
}`;

const cppTestCode = `#include <catch2/catch_test_macros.hpp>
#include "solution.cpp"

TEST_CASE("Add positive numbers", "[add]") {
    REQUIRE(add(1, 2) == 3);
}

TEST_CASE("Add negative numbers", "[add]") {
    REQUIRE(add(-1, -2) == -3);
}

TEST_CASE("Add with zero", "[add]") {
    REQUIRE(add(0, 5) == 5);
    REQUIRE(add(5, 0) == 5);
}`;
</script>

<style scoped>
.tutorial-content h3 {
  color: var(--primary-color);
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.tutorial-content h4 {
  color: var(--text-color);
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
}

.tutorial-content h5 {
  color: var(--text-color);
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.tutorial-content code {
  background-color: var(--surface-ground);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.tutorial-content ul {
  margin-bottom: 1rem;
}

.tutorial-content li {
  margin-bottom: 0.5rem;
}

.tutorial-content p {
  margin-bottom: 1rem;
}
</style>
