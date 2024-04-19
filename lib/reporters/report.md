# Accessibility Report For "{{& pageUrl}}"

> 🗓️ Generated at: {{date}}

| Type        | Total            |
| ----------- | ---------------- |
| 🔴 Error    | {{errorCount}}   |
| 🟡 Warnings | {{warningCount}} |
| 🟢 Notice   | {{noticeCount}}  |

## Details

{{#issues}}

### {{emoji}} {{typeLabel}} [{{code}}]({{codeUrl}})

{{message}}

```
{{{selector}}}
```

```
{{{context}}}
```

{{/issues}}
