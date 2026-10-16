# Content authoring

These rules apply to agents assigned to write or edit portfolio content. Application implementation agents may change application files when explicitly requested.

## Allowed edits

Content-writing agents may only change `content/` and `public/images/`. Do not change routes, components, dependencies, configuration, or this guide as part of a content-writing task.

Run `npm run build` successfully before every commit. Install dependencies with pnpm, following the repository README.

## Required writing skill

Whenever the user asks to add or edit content, write all reader-facing text in English. This includes titles, summaries, descriptions, headings, body text, image alt text, captions, series titles, and link labels. Translate non-English source material faithfully; preserve code, commands, paths, URLs, and proper names.

Always use the `humanizer:humanizer` skill when writing or editing content in `content/`, including titles, summaries, and descriptions. Read [the humanizer skill](C:/Users/HETI/.agents/skills/humanizer/SKILL.md) before drafting and follow its rewrite and review process.

Write only the final version to the MDX file. Preserve supported facts, code, paths, and link targets. Do not invent outcomes, metrics, or personal experience. If the skill is unavailable, report the missing skill instead of silently skipping it.

## Files and frontmatter

All content lives in `content/blog/<slug>.mdx`. Use lowercase, hyphen-separated slugs, for example `moodle-alibaba-ack-ha-blueprint`. The filename determines `/blog/<slug>`. Do not create separate Projects or Notes collections.

Dates must be quoted valid calendar dates in `YYYY-MM-DD` format. Required text must be nonempty. Content is published after a rebuild.

Every article requires `title`, `date`, `summary`, and `type`. Choose `post` for ordinary posts or notes, `case-study` for work with context, implementation decisions, and evidence, or `guide` for instructional content. Rendering uses the type; do not create custom routes or templates for an article.

Shared optional fields: `tags` (string array, default `[]`), `draft` (boolean, default `false`), `featured` (boolean, default `false`), `cover` (image path or HTTP(S) URL), and `series` (see below). Case studies can also use `role` (string), `stack` (string array, default `[]`), and `links` (array of `{ label, href }`, local absolute paths or HTTP(S) URLs). Role, stack, and project links appear only on case studies.

Articles with `draft: true` are excluded from listing, detail routes, filters, series pages, Previous/Next navigation, sitemap, and RSS in development and production. There is no draft preview route.

```yaml
---
title: Reengineering SPH website infrastructure on Azure
type: case-study
date: '2024-09-14'
summary: Server reengineering and website migration for SPH on Azure.
role: Primary implementer
stack: [Azure, AlmaLinux, LiteSpeed, Cloudflare, WordPress]
tags: [infrastructure, wordpress]
---
```

For a simple post, use Markdown without requiring any custom MDX components:

```yaml
---
title: Before restarting a service
type: post
date: '2026-10-16'
summary: Collect evidence before a restart.
tags: [linux, operations]
draft: false
---
```

## Guide series

A guide may stand alone or belong to a series. To create a series, add the same `series.slug` and English `series.title` to each part, with a unique positive integer `series.order`. Use ascending order for the reading sequence, independent of publication dates. A series with one published part is valid, and gaps in order values are allowed.

```yaml
---
title: Preparing a Linux server
type: guide
date: '2026-10-16'
summary: Prepare the server before deploying the application.
tags: [linux, deployment]
series:
  slug: linux-deployment
  title: Deploying an application on Linux
  order: 1
---
```

Series pages at `/blog/series/<series-slug>` are generated from published articles. Previous/Next links follow published parts only; never add links to unpublished drafts manually. Duplicate published order values or inconsistent titles for the same series slug fail the build. A series with only drafts has no public page. Series metadata can also group other article types when needed.

## Markdown and MDX

Use Markdown for headings (start body headings at `##`), links, lists, quotes, tables, and images. Use fenced code blocks with a language such as `bash`, `yaml`, or `typescript` for syntax highlighting. Components are registered automatically; do not import or export code in MDX. Use string attributes and nested Markdown, not JavaScript expressions. Leave blank lines around Markdown inside components.

Available components: `Callout`, `Section`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `Gallery`.

```mdx
<Callout title="A useful detail">

An observation worth keeping close to the explanation.

</Callout>

<Section title="Implementation" id="implementation">

Explain the decision here.

</Section>

<Tabs defaultValue="build">
<TabsList>
<TabsTrigger value="build">Build</TabsTrigger>
<TabsTrigger value="verify">Verify</TabsTrigger>
</TabsList>
<TabsContent value="build">

Describe the build step.

</TabsContent>
<TabsContent value="verify">

Describe verification.

</TabsContent>
</Tabs>

<Gallery>

![Workflow diagram](/images/pipeline-lab/pipeline.svg)

![Release checkpoints](/images/pipeline-lab/checkpoints.svg)

</Gallery>
```

`Callout` accepts an optional `title` and children. `Section` requires `title`, accepts optional `id`, and contains children. Tabs require a `defaultValue` matching a trigger and content `value`; use unique values within each set. `Gallery` contains Markdown images and uses a responsive grid.

## Images and accuracy

Place images in `public/images/<slug>/` and reference `/images/<slug>/<filename>`. Supply descriptive alt text and appropriately sized images. Do not claim unverified client work, outcomes, or metrics. Label illustrative projects as demonstrations.
