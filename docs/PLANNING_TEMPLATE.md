# Planning template

How to turn an app idea into specs, phases and checkpoints before writing code.

## 1. Idea in one page

- What is it, in one sentence?
- Who uses it, on which device, in what situation?
- What are the 3 to 5 things a user must be able to do? (Everything else is "later".)

## 2. Spec

Write `docs/project-spec.md` with:

- **Scope:** features in, features out (a "Later" list).
- **Users and permissions:** the roles, if any. The boilerplate has one `USER` role; see ADDING_A_FEATURE.md for adding more.
- **Screens:** name, purpose, data it needs.
- **API:** endpoints, request and response shapes.
- **Data model:** entities, fields, relations.
- **Rules:** validation, workflows, error cases.
- **Non-functional:** platforms, offline needs, security, performance.

If the spec and the code later disagree, ask; never assume which is right.

## 3. Design

Fill `docs/design-brief.md` (mood, references, colors, type, shape, motion, must-have screens). Do this before any UI work.

## 4. Phases

Split the work into phases that each end in something you can run: foundation, then data and auth, then the main features, then polish. Order by dependency; risky or unknown parts early.

## 5. Checkpoints

Split each phase into numbered checkpoints (1.1, 1.2, ...). A good checkpoint:

- is small enough to finish and verify in one sitting,
- changes one concern (one screen, one endpoint, one slice),
- has a clear "done" check you can name (typecheck passes, screen renders, endpoint answers).

Put them into `docs/PROGRESS.md` and follow its working agreement.

## 6. Before the first checkpoint

- Rename the app (README, "Rename the app").
- Fill the design brief.
- Confirm the checkpoint list.
