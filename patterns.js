// Function to fetch data from patterns.json
async function fetchData() {
    try {
        const response = await fetch('patterns.json');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        return data.organisations; // Return only the organisations array
    } catch (error) {
        console.error("Failed to fetch pattern data:", error);
    }
}

// Function to group patterns by name
function groupPatternsByName(data) {
    const patternMap = {};
    const prefixCount = {};
    const orgVariantCount = {}; // New object to hold variant counts for each organisation

    // Collect base names and their counts for better grouping
    data.forEach(({ categories }) => {
        categories.forEach(({ links }) => {
            links.forEach(({ name }) => {
                const baseName = name.toLowerCase(); // Changed to use the full name
                prefixCount[baseName] = (prefixCount[baseName] || 0) + 1;
            });
        });
    });

    // Build the patternMap based on unique or grouped patterns
    data.forEach(({ name: organisation, url, categories }) => {
        orgVariantCount[organisation] = orgVariantCount[organisation] || 0; // Initialize if not present
        categories.forEach(({ title, links }) => {
            links.forEach(({ name, href }) => {
                const baseName = name.toLowerCase(); // Use the full name for distinct identification
                const isUniqueOrg = !data.some(other =>
                    other.name !== organisation &&
                    other.categories.some(cat =>
                        cat.links.some(link => link.name.toLowerCase() === baseName) // Check full name
                    )
                );

                // Display name based on uniqueness
                const displayName = isUniqueOrg || prefixCount[baseName] === 1
                    ? name
                    : name; // Retain the full name as is for clarity

                // Initialize the entry if not already in the map
                if (!patternMap[displayName]) {
                    patternMap[displayName] = { name: displayName, items: [], variantCount: 0, title }; // Include title here
                }

                // Correctly form the full URL
                const fullUrl = new URL(href, url).href; // Use the URL constructor for proper concatenation

                // Add the organisation and the properly formed URL to this pattern entry
                patternMap[displayName].items.push({ organisation, url: fullUrl });
                patternMap[displayName].variantCount = prefixCount[baseName];

                // Increment the variant count for this organisation
                orgVariantCount[organisation]++;
            });
        });
    });

    return { patternMap, orgVariantCount }; // Return both pattern map and organisation variant counts
}

// Function to display patterns in the HTML
function displayPatterns(patternMap, searchTerm = "") {
    const patternList = document.getElementById("patternList");
    patternList.innerHTML = ""; // Clear previous patterns

    // Sort pattern keys alphabetically
    const sortedPatternKeys = Object.keys(patternMap).sort((a, b) => a.localeCompare(b));

    sortedPatternKeys.forEach((key) => {
        const pattern = patternMap[key];
        const patternName = pattern.name.toLowerCase();

        // Filter based on the search term
        if (
            searchTerm === "" ||
            patternName.includes(searchTerm) ||
            pattern.items.some(item => item.organisation.toLowerCase().includes(searchTerm))
        ) {
            const patternDiv = document.createElement("div");
            patternDiv.classList.add("component-item", "col-12", "col-md-6", "col-lg-4"); // Updated class to match styles

            // Pattern Title (small tag)
            const titleTag = document.createElement("small"); // Create a small tag for the category title
            titleTag.classList.add("pattern-category-title"); // Add class for styling
            titleTag.textContent = pattern.title || ''; // Set to empty string if no title is present
            patternDiv.appendChild(titleTag);

            // Pattern Name
            const nameDiv = document.createElement("div");
            nameDiv.classList.add("component-title"); // Updated to match styles
            nameDiv.textContent = pattern.name;
            patternDiv.appendChild(nameDiv);

            // Variant Count
            const variantCount = document.createElement("div");
            variantCount.classList.add("variant-count");
            variantCount.textContent = `Number of variant(s): ${pattern.variantCount}`;
            patternDiv.appendChild(variantCount);

            // Organisation Links
            const sortedItems = pattern.items.sort((a, b) => a.organisation.localeCompare(b.organisation));
            const linkList = document.createElement("ul");
            linkList.classList.add("organisation-links");

            sortedItems.forEach(({ organisation, url }) => {
                const listItem = document.createElement("li");
                const link = document.createElement("a");
                link.href = url;
                link.textContent = organisation;
                link.target = "_blank";
                listItem.appendChild(link);
                linkList.appendChild(listItem);
            });

            patternDiv.appendChild(linkList);
            patternList.appendChild(patternDiv);
        }
    });
}

// Main execution function
async function main() {
    const data = await fetchData();
    if (data) {
        const patternMap = groupPatternsByName(data);

        // Initial display of patterns
        displayPatterns(patternMap);

        // Search functionality
        const searchInput = document.getElementById("searchInput");
        searchInput.addEventListener("input", (event) => {
            const searchTerm = event.target.value.toLowerCase().trim();
            displayPatterns(patternMap, searchTerm);
        });
    }
}

// Run the main function
main();
