/**
 * Fetch Projects Script
 * 
 * Fetches public repositories from GitHub for user 'MrWhoCoded'
 * and generates assets/data/projects.json.
 * 
 * Features:
 * - Fetches all public repos
 * - Includes ONLY repos with a README
 * - Extracts clean descriptions from README or falls back to repo description
 * - Handles encoding issues (UTF-16 LE BOM detection/skipping)
 * - Title cases repo names
 * - Generates clean, ready-to-use projects.json
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const USERNAME = 'MrWhoCoded';
const OUTPUT_FILE = path.join(__dirname, '../assets/data/projects.json');
const USER_AGENT = 'Portfolio-Project-Fetcher';

// Helper: Title Case
function toTitleCase(str) {
    return str.replace(/-/g, ' ').replace(/_/g, ' ')
        .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

// Helper: Clean Description
function cleanDescription(text) {
    if (!text) return null;

    // Check for binary/garbage characters (like UTF-16 null bytes)
    if (text.includes('\u0000')) return null;

    // Remove Markdown headers, images, badges, links
    let clean = text
        .replace(/^#\s+.+$/gm, '')        // Remove H1 headers
        .replace(/!\[.*?\]\(.*?\)/g, '')  // Remove images
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Keep text of links
        .replace(/```[\s\S]*?```/g, '')   // Remove code blocks
        .replace(/<[^>]*>/g, '')          // Remove HTML tags
        .replace(/\r\n/g, '\n')           // Normalize newlines
        .trim();

    // Get first valid paragraph
    const lines = clean.split('\n').map(l => l.trim()).filter(l => l.length > 10 && !l.startsWith('#') && !l.startsWith('!'));

    if (lines.length > 0) {
        let desc = lines[0];
        if (desc.length > 150) desc = desc.substring(0, 147) + '...';
        return desc;
    }

    return null;
}

// Helper: Request
function request(url, isRaw = false) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': USER_AGENT,
                'Accept': isRaw ? 'text/plain' : 'application/vnd.github.v3+json'
            }
        };

        https.get(url, options, (res) => {
            let data = '';

            // Handle redirects manually if needed (simple version)
            if (res.statusCode === 301 || res.statusCode === 302) {
                return request(res.headers.location, isRaw).then(resolve).catch(reject);
            }

            if (res.statusCode >= 400) {
                if (res.statusCode === 404) return resolve(null); // Not found
                return reject(new Error(`Request failed: ${res.statusCode} ${url}`));
            }

            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    // If raw, return string. If JSON, parse it.
                    resolve(isRaw ? data : JSON.parse(data));
                } catch (e) {
                    resolve(data);
                }
            });
        }).on('error', reject);
    });
}

async function main() {
    console.log(`Fetching repositories for ${USERNAME}...`);

    try {
        const repos = await request(`https://api.github.com/users/${USERNAME}/repos?sort=updated&per_page=100`);

        if (!Array.isArray(repos)) {
            throw new Error('Invalid response from GitHub API');
        }

        console.log(`Found ${repos.length} repositories.`);
        const projects = [];
        const skipped = [];

        for (const repo of repos) {
            // Fetch README
            const readme = await request(`https://raw.githubusercontent.com/${USERNAME}/${repo.name}/${repo.default_branch}/README.md`, true);

            if (!readme) {
                skipped.push(repo.name);
                continue;
            }

            // Process description
            let description = cleanDescription(readme);

            // Fallback to repo description if extraction failed or was garbage
            if (!description) {
                description = repo.description || "View project on GitHub.";
            }

            // Tech formatting
            const tech = [];
            if (repo.language) tech.push(repo.language);
            if (repo.topics) tech.push(...repo.topics);
            const uniqueTech = [...new Set(tech)].slice(0, 4);

            projects.push({
                title: toTitleCase(repo.name),
                description: description,
                tech: uniqueTech,
                url: repo.html_url,
                stars: repo.stargazers_count
            });

            process.stdout.write('.'); // Progress indicator
        }

        console.log('\n');

        // Sort by stars
        projects.sort((a, b) => b.stars - a.stars);

        // Save
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(projects, null, 2));

        console.log('--------------------------------------------------');
        console.log(`✅ Saved ${projects.length} projects to projects.json`);
        console.log('--------------------------------------------------');

        if (skipped.length > 0) {
            console.log(`⚠️  Skipped ${skipped.length} repositories (no README):`);
            skipped.forEach(name => console.log(`   - ${name}`));
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

main();
