# DLD Competency Matrix (ACU Online)

A static website for the Digital Learning Design competency matrix. It has no build step and no server code.

## Pages
- `index.html` – overview and roles
- `matrix.html` – descriptors by role (`?role=ADLD|DLD|SDLD|LDLD`)
- `progression.html` – one competency across all roles (`?c=<competency-id>`)
- `plan.html` – plan builder for Progress Plan goals (selections are saved only in the viewer's browser)
- `cdf.html` – Capability Development Framework reference with LinkedIn Learning paths
- `about.html` – purpose, Progress Plan use, sources

## Publish on GitHub Pages
1. Create a repository and upload everything in this folder, including the hidden `.nojekyll` file, to the root.
2. In the repository, go to **Settings → Pages**, set **Source** to *Deploy from a branch*, and choose `main` and `/ (root)`.
3. The site appears at `https://<username>.github.io/<repository>/` after a minute or two.

## Editing content
All matrix content is in `assets/data.js` (one JSON object). Edit descriptors, CDF tags or LinkedIn Learning links there; the pages update automatically.
To add the missing *Live ACU's mission, vision and values* LinkedIn Learning link, set the `"link"` value for that entry in the `cdf` list.
