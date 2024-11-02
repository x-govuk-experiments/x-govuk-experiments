import requests
from bs4 import BeautifulSoup

# URL of the webpage
url = 'https://service-manual.ons.gov.uk/design-system/components'  # Replace with the actual URL

# Fetch the content of the URL
response = requests.get(url)
if response.status_code == 200:
    # Parse the HTML content
    soup = BeautifulSoup(response.text, 'html.parser')

    # Find all components and links
    components = []
    for item in soup.select('ul.ons-section-nav__list li.ons-section-nav__item a.ons-section-nav__link'):
        link = item['href']
        name = item.get_text(strip=True)
        components.append({'name': name, 'link': link})

    # Display the components
    for component in components:
        print(f"Component name: {component['name']}, Link: {component['link']}")
else:
    print("Failed to retrieve the webpage.")
