// Function to fetch data from component.json
async function fetchData() {
    try {
        const response = await fetch('components.json');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch component data:", error);
    }
}

function groupComponentsByName(data) {
    const componentMap = {};
    const orgVariantCount = {}; // Track variant counts by organization

    // Build the componentMap based on unique component names
    data.forEach(({ organisation, components }) => {
        orgVariantCount[organisation] = orgVariantCount[organisation] || 0; // Initialize if not present

        components.forEach(({ name, url }) => {
            const displayName = name; // Use the full name as the display name

            // Initialize the entry if not already in the map
            if (!componentMap[displayName]) {
                componentMap[displayName] = { name: displayName, items: [], variantCount: 0 };
            }

            // Add organisation and URL to this component entry
            componentMap[displayName].items.push({ organisation, url });
            componentMap[displayName].variantCount++; // Increment variant count

            // Increment the variant count for this organisation
            orgVariantCount[organisation]++;
        });
    });

    return { componentMap, orgVariantCount }; // Return both component map and organisation variant counts
}

// Function to display components in the HTML
function displayComponents(componentMap, searchTerm = "") {
    const componentList = document.getElementById("componentList");
    componentList.innerHTML = ""; // Clear previous components

    // Sort component keys alphabetically
    const sortedComponentKeys = Object.keys(componentMap).sort((a, b) => a.localeCompare(b));

    sortedComponentKeys.forEach((key) => {
        const component = componentMap[key];
        const componentName = component.name.toLowerCase();

        // Filter based on the search term, if present
        if (
            searchTerm === "" ||
            componentName.includes(searchTerm) ||
            component.items.some(item => item.organisation.toLowerCase().includes(searchTerm))
        ) {
            const componentDiv = document.createElement("div");
            componentDiv.classList.add("component-item", "col-12", "col-md-6", "col-lg-4");

            // Component Title
            const title = document.createElement("div");
            title.classList.add("component-title");
            title.textContent = component.name;
            componentDiv.appendChild(title);

            // Variant Count
            const variantCount = document.createElement("div");
            variantCount.classList.add("variant-count"); // Use CSS class for styling
            variantCount.textContent = `number of variant(s) ${component.variantCount}`;
            componentDiv.appendChild(variantCount);

            // Organisation Links
            const sortedItems = component.items.sort((a, b) => a.organisation.localeCompare(b.organisation));
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

            componentDiv.appendChild(linkList);
            componentList.appendChild(componentDiv);
        }
    });
}

// Main execution function
async function main() {
    const data = await fetchData();
    if (data) {
        const { componentMap } = groupComponentsByName(data);
        
        // Initial display of components
        displayComponents(componentMap);
        
        // Search functionality
        const searchInput = document.getElementById("searchInput");
        searchInput.addEventListener("input", (event) => {
            const searchTerm = event.target.value.toLowerCase().trim();
            displayComponents(componentMap, searchTerm);
        });
    }
}

// Run the main function
main();
