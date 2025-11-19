# Media Validator

## Overview
The Media Validator project allows users to fetch and classify various media items (images and videos) from online sources. Users can mark each media item as either working or broken and specify whether it is a product or a user post. The results of the validation process are saved in a JSON file for further analysis.

## Project Structure
```
media-validator
├── src
│   ├── index.html         # Main HTML document for the user interface
│   ├── styles
│   │   └── style.css      # CSS styles for the application
│   └── scripts
│       └── app.js         # JavaScript logic for media validation
├── data
│   └── results.json       # JSON file to store validation results
└── README.md              # Project documentation
```

## Setup Instructions
1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd media-validator
   ```

2. **Open the Project**
   Open the project in your preferred code editor.

3. **Run the Application**
   Open `src/index.html` in a web browser to start the media validation process.

## Functionality
- Users can view a series of media items (images and videos).
- Each media item can be classified as:
  - **Working**: If the media item is functional.
  - **Broken**: If the media item does not work.
- For working media items, users can specify the type:
  - **Product**: If the media item is related to a product.
  - **User Post**: If the media item is a user-generated post.
- The results of the classification are saved in `data/results.json` in a structured format.

## Technologies Used
- HTML
- CSS
- JavaScript

## License
This project is licensed under the MIT License.