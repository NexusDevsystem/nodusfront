
$path = "c:\Users\jaoom\OneDrive\Área de Trabalho\projetos\nodus\frontend\src\components\link-editor\SortableLinkItem.tsx"
$content = Get-Content $path -Raw

# 1. Hide Title/URL Grid
$target1 = '<div className="grid grid-cols-1 md:grid-cols-2 gap-6">\s+<div className="space-y-2">[\s\S]+?<\/div>\s+<\/div>'
# Wait, let's be more precise with regex.
# We want to wrap lines 1003 to 1042.

$lines = Get-Content $path
$newLines = @()

for ($i = 0; $i -lt $lines.Count; $i++) {
    $lineNum = $i + 1
    if ($lineNum -eq 1003) {
        $newLines += '                                                                    {!isInstagramLink && ('
    }
    $newLines += $lines[$i]
    if ($lineNum -eq 1042) {
        $newLines += '                                                                    )}'
    }
    if ($lineNum -eq 1044) {
        $newLines += '                                                                    {!isInstagramLink && ('
    }
    if ($lineNum -eq 1073) {
        $newLines += '                                                                    )}'
    }
}

$newLines | Set-Content $path -Encoding UTF8
