<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$url = $_GET['url'] ?? '';

if (!$url) {
    http_response_code(400);
    echo json_encode(['error' => 'URL is required']);
    exit;
}

$isReel = (bool) preg_match('#instagram\.com/reel/#i', $url);
$isStory = (bool) preg_match('#instagram\.com/stories/[^/?#]+/\d+#i', $url);

if (!$isReel && !$isStory) {
    http_response_code(400);
    echo json_encode(['error' => 'Only Instagram reel or active story URLs are supported.']);
    exit;
}

function curlRequest(string $requestUrl, array $options = []): ?string
{
    $ch = curl_init();
    $defaults = [
        CURLOPT_URL => $requestUrl,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_ENCODING => '',
        CURLOPT_HTTPHEADER => [
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            'Accept-Language: en-US,en;q=0.9',
        ],
    ];

    curl_setopt_array($ch, $defaults + $options);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if (!$response || $httpCode >= 400) {
        return null;
    }

    return $response;
}

function extractJsVar(string $name, string $source): ?string
{
    if (preg_match('/' . preg_quote($name, '/') . '\s*=\s*"([^"]+)"/', $source, $match)) {
        return $match[1];
    }

    return null;
}

function parseSaveinstaHtml(string $html, string $sourceUrl): ?array
{
    libxml_use_internal_errors(true);
    $doc = new DOMDocument();
    $doc->loadHTML('<?xml encoding="utf-8" ?>' . $html);
    libxml_clear_errors();

    $xpath = new DOMXPath($doc);
    $items = [];
    $cover = '';
    $author = 'Unknown';
    $title = 'Instagram Media';

    $isStory = (bool) preg_match('#instagram\.com/stories/([^/?#]+)/#i', $sourceUrl, $storyMatch);
    if ($isStory && !empty($storyMatch[1])) {
        $author = '@' . $storyMatch[1];
        $title = 'Instagram Story';
    }

    foreach ($xpath->query('//ul[@class="download-box"]/li') as $li) {
        $thumbNode = $xpath->query('.//div[contains(@class,"download-items__thumb")]//img', $li)->item(0);
        if ($thumbNode && !$cover) {
            $thumb = $thumbNode->getAttribute('src') ?: $thumbNode->getAttribute('data-src');
            if ($thumb && !str_contains($thumb, 'loader.gif')) {
                $cover = $thumb;
            }
        }

        $iconNode = $xpath->query('.//div[contains(@class,"download-items__thumb")]//i', $li)->item(0);
        $iconClass = $iconNode ? $iconNode->getAttribute('class') : '';
        $isImage = str_contains($iconClass, 'icon-dlimage');
        $isVideo = str_contains($iconClass, 'icon-dlvideo');

        $btnNodes = $xpath->query('.//div[contains(@class,"download-items__btn")]//a', $li);
        $mediaUrl = null;

        foreach ($btnNodes as $anchor) {
            $href = trim($anchor->getAttribute('href'));
            if (!$href) {
                continue;
            }

            if ($anchor->hasAttribute('video')) {
                $mediaUrl = $href;
                $isVideo = true;
                break;
            }

            $text = strtolower(trim($anchor->textContent));
            if (str_contains($text, 'download video')) {
                $mediaUrl = $href;
                $isVideo = true;
                break;
            }

            if (str_contains($text, 'download image') || str_contains($text, 'download photo')) {
                $mediaUrl = $href;
                $isImage = true;
                break;
            }
        }

        if (!$mediaUrl && $btnNodes->length > 0) {
            $mediaUrl = trim($btnNodes->item(0)->getAttribute('href'));
        }

        if (!$mediaUrl) {
            continue;
        }

        $type = $isImage && !$isVideo ? 'photo' : 'video';
        $items[] = ['url' => $mediaUrl, 'type' => $type];
    }

    $seen = [];
    $uniqueItems = [];
    foreach ($items as $item) {
        if (isset($seen[$item['url']])) {
            continue;
        }
        $seen[$item['url']] = true;
        $uniqueItems[] = $item;
    }

    if (empty($uniqueItems)) {
        return null;
    }

    if (!$isStory) {
        $videoItems = array_values(array_filter($uniqueItems, fn($item) => $item['type'] === 'video'));
        if (!empty($videoItems)) {
            $uniqueItems = $videoItems;
        }
    }

    if (!$cover) {
        $cover = $uniqueItems[0]['url'];
    }

    $mediaType = $isStory ? 'story' : 'reel';
    $safeAuthor = preg_replace('/[^a-zA-Z0-9_-]/', '', ltrim($author, '@')) ?: 'instagram';

    $normalizedItems = [];
    foreach ($uniqueItems as $index => $item) {
        $ext = $item['type'] === 'photo' ? 'jpg' : 'mp4';
        $suffix = count($uniqueItems) > 1 ? '_' . ($index + 1) : '';
        $normalizedItems[] = [
            'url' => $item['url'],
            'type' => $item['type'],
            'filename' => "{$safeAuthor}_{$mediaType}{$suffix}.{$ext}",
        ];
    }

    return [
        'platform' => 'instagram',
        'type' => $mediaType,
        'title' => $title,
        'author' => $author,
        'cover' => $cover,
        'items' => $normalizedItems,
    ];
}

function fetchFromSaveinsta(string $url): ?array
{
    $pageHtml = curlRequest('https://saveinsta.to/en/highlights', [
        CURLOPT_HTTPHEADER => [
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Referer: https://www.google.com/',
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        ],
    ]);

    if (!$pageHtml || !preg_match('/<script[^>]*>var\s+k_url_search="[^"]+"(.*?)<\/script>/s', $pageHtml, $matches)) {
        return null;
    }

    $scriptBlock = $matches[1];
    $kExp = extractJsVar('k_exp', $scriptBlock);
    $kToken = extractJsVar('k_token', $scriptBlock);

    if (!$kExp || !$kToken) {
        return null;
    }

    $verifyResponse = curlRequest('https://saveinsta.to/api/userverify', [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query(['url' => $url]),
        CURLOPT_HTTPHEADER => [
            'Accept: */*',
            'Content-Type: application/x-www-form-urlencoded; charset=UTF-8',
            'Origin: https://saveinsta.to',
            'Referer: https://saveinsta.to/en/video',
            'X-Requested-With: XMLHttpRequest',
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        ],
    ]);

    $verifyData = json_decode($verifyResponse ?? '', true);
    if (!$verifyData || empty($verifyData['token'])) {
        return null;
    }

    $searchResponse = curlRequest('https://saveinsta.to/api/ajaxSearch', [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query([
            'k_exp' => $kExp,
            'k_token' => $kToken,
            'q' => $url,
            't' => 'media',
            'lang' => 'en',
            'v' => 'v2',
            'cftoken' => $verifyData['token'],
        ]),
        CURLOPT_HTTPHEADER => [
            'Accept: */*',
            'Content-Type: application/x-www-form-urlencoded; charset=UTF-8',
            'Origin: https://saveinsta.to',
            'Referer: https://saveinsta.to/en/highlights',
            'X-Requested-With: XMLHttpRequest',
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        ],
    ]);

    $searchData = json_decode($searchResponse ?? '', true);
    if (!$searchData || ($searchData['status'] ?? '') !== 'ok' || empty($searchData['data'])) {
        return null;
    }

    return parseSaveinstaHtml($searchData['data'], $url);
}

$result = fetchFromSaveinsta($url);

if (!$result) {
    http_response_code(502);
    echo json_encode([
        'error' => 'Could not fetch media. The content may be private, expired, or unavailable.',
    ]);
    exit;
}

echo json_encode($result);
