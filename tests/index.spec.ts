import { describe, it, expect } from "vitest";
import dedent from "dedent";
import { process } from "./util/process";

const source = dedent`
  # The Main Heading

  [inline](./foo.go#L8-L10)
  [ignore](./foo.go#L8-L10)
  ## Ignore URLs of all sort
  [inline](https://example.com)
  [inline](https://example.com#L8-L10)
  [inline](https://example.com#L8)
  [inline](https://github.com/hashicorp/terraform/blob/main/internal/promising/promise.go#L30-L40)
  ## Ignored because file not found
  [inline](./not-found.go#L3-L5)
`;

describe("remark-inline-local-code-snippets", () => {
  // ******************************************
  it("with no options", async () => {
    const result = await process(source, {});
    expect(result.toString()).toMatchInlineSnapshot(`
      "
      <h1>The Main Heading</h1>
      <p>
        <pre><code class="language-go">func helloHandler(w http.ResponseWriter, r *http.Request) {
          fmt.Fprintf(w, "Hello, you've requested: %s\\n", r.URL.Path)
      }
      </code></pre><a href="./foo.go#L8-L10">ignore</a>
      </p>
      <h2>Ignore URLs of all sort</h2>
      <p>
        <a href="https://example.com">inline</a>
        <a href="https://example.com#L8-L10">inline</a>
        <a href="https://example.com#L8">inline</a>
        <a href="https://github.com/hashicorp/terraform/blob/main/internal/promising/promise.go#L30-L40">inline</a>
      </p>
      <h2>Ignored because file not found</h2>
      <p><a href="./not-found.go#L3-L5">inline</a></p>
      "
    `);
  });

  it("with originComment option", async () => {
    const result = await process(source, {
      originComment: "Source: <url>",
    });
    expect(result.toString()).toMatchInlineSnapshot(`
      "
      <h1>The Main Heading</h1>
      <p>
        <pre><code class="language-go">// Source: ./foo.go
      func helloHandler(w http.ResponseWriter, r *http.Request) {
          fmt.Fprintf(w, "Hello, you've requested: %s\\n", r.URL.Path)
      }
      </code></pre><a href="./foo.go#L8-L10">ignore</a>
      </p>
      <h2>Ignore URLs of all sort</h2>
      <p>
        <a href="https://example.com">inline</a>
        <a href="https://example.com#L8-L10">inline</a>
        <a href="https://example.com#L8">inline</a>
        <a href="https://github.com/hashicorp/terraform/blob/main/internal/promising/promise.go#L30-L40">inline</a>
      </p>
      <h2>Ignored because file not found</h2>
      <p><a href="./not-found.go#L3-L5">inline</a></p>
      "
    `);
  });
});
