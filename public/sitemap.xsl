<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Sitemap</title>
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: #f8fafc;
            margin: 0;
            padding: 2rem;
          }
          main {
            max-width: 960px;
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            margin: 0 auto;
            padding: 2rem;
          }
          h1 {
            font-size: 1.75rem;
            margin: 0 0 1rem;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th,
          td {
            border-top: 1px solid #e5e7eb;
            padding: 0.75rem;
            text-align: left;
            vertical-align: top;
          }
          th {
            background: #f1f5f9;
            font-weight: 700;
          }
          a {
            color: #2563eb;
            overflow-wrap: anywhere;
          }
        </style>
      </head>
      <body>
        <main>
          <h1>Sitemap</h1>
          <xsl:choose>
            <xsl:when test="sm:sitemapindex">
              <table>
                <thead>
                  <tr>
                    <th>Sitemap</th>
                    <th>Last modified</th>
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="sm:sitemapindex/sm:sitemap">
                    <tr>
                      <td>
                        <a href="{sm:loc}">
                          <xsl:value-of select="sm:loc" />
                        </a>
                      </td>
                      <td>
                        <xsl:value-of select="sm:lastmod" />
                      </td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </xsl:when>
            <xsl:otherwise>
              <table>
                <thead>
                  <tr>
                    <th>URL</th>
                    <th>Last modified</th>
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="sm:urlset/sm:url">
                    <tr>
                      <td>
                        <a href="{sm:loc}">
                          <xsl:value-of select="sm:loc" />
                        </a>
                      </td>
                      <td>
                        <xsl:value-of select="sm:lastmod" />
                      </td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </xsl:otherwise>
          </xsl:choose>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
