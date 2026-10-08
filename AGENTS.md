<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Model futsal as one continuous ladder: Elite (LNF), A (Silver), B (Ouro), C (Prata), D (Bronze), then Amador; this keeps display leagues and movement coherent.
- Store browser careers in five indexed slots with one active slot; this preserves independent progress and enables reliable migration from the legacy save.
- Keep combat sports in isolated domain modules while sharing the career clock and agency finances; this protects football simulation rules from cross-domain regressions.
- Persist combat actions with each resolved fight and replay only that stored history; this prevents duplicate results and payments.
- Store scouting visits and their candidate IDs in each career, exposing candidates only after attendance; this keeps discovery progressive and repeatable.
- Run combat domain regression tests with Bun's test runner; this verifies persisted careers and simulation without browser dependencies.
