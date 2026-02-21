# Clarity

A minimal Hugo theme focused on clarity and legibility, packaged as a [Hugo Module](https://gohugo.io/hugo-modules/). Used on [asabharwal.com](https://asabharwal.com) and [thymetravel.co](https://thymetravel.co).

## Features

- **Light & Dark mode** with system preference detection and no flash of unstyled content
- **Client-side search** powered by Fuse.js with fuzzy matching and result highlighting
- **EB Garamond** variable serif font for clean, readable typography
- **SEO** — Open Graph, Twitter Cards, JSON-LD Article schema, canonical URLs, RSS
- **Responsive** mobile-first design
- **Umami analytics** integration (privacy-first)
- **Content types** — posts, pages, recipes, archives, tags
- **Accessible** — skip links, semantic HTML, ARIA labels, keyboard navigation

## Installation

Requires Hugo `>= 0.74.0` (extended edition) and Go.

### 1. Initialize Hugo Modules (if not already done)

```bash
hugo mod init github.com/<your-username>/<your-site>
```

### 2. Add the theme to your `hugo.toml`

```toml
[module]
  [[module.imports]]
    path = "github.com/asbrwl/clarity"
```

### 3. Fetch the module

```bash
hugo mod get -u
```

## Configuration

### Site Parameters

```toml
[params]
  author = "Your Name"
  description = "Site description"
  me = "Display Name"            # shown on posts
  hero_image = "/img/hero.jpg"
  hero_introduction = "Hello..."
  ogimg = "/img/og-default.jpg"  # default Open Graph image

  # Umami analytics (optional)
  analytics_src = "https://analytics.example.com/script.js"
  analytics_id = "site-id"
  analytics_domains = "example.com"
```

### Menus

```toml
[[menus.header]]
  name = "Blog"
  url = "/post/"
  weight = 1

[[menus.footer]]
  name = "RSS"
  url = "/index.xml"
  weight = 1
```

### Front Matter

Posts support the following front matter:

```yaml
title: "Post Title"
date: 2025-01-01
tags: ["hugo", "theme"]
featured_image: "/img/post-hero.jpg"
featured_image_desc: "Image caption"
subtitle: "Optional subtitle"
toc: true  # show table of contents
```

## Content Types

| Type | Path | Description |
|------|------|-------------|
| Posts | `content/post/` | Blog posts with metadata, featured images, and navigation |
| Recipes | `content/recipe/` | Recipe entries with episode number support |
| Pages | `content/` | Generic pages |

### Special Pages

- **Search** — add `content/search.md` with `layout: search`
- **Archives** — add `content/archives.md` with `layout: archives`

## Shortcodes

### Raw HTML

```markdown
{{< rawhtml >}}
<div>Custom HTML here</div>
{{< /rawhtml >}}
```

## Development

Clone the repo and use `hugo server` with a site that imports this module locally:

```toml
[module]
  [[module.imports]]
    path = "github.com/asbrwl/clarity"
  replacements = "github.com/asbrwl/clarity -> /path/to/local/clarity"
```

## License

[MIT](LICENSE)
