# **App Name**: InsightWatch

## Core Features:

- Video Upload & Processing: Allows users to upload CCTV videos, which are then processed for scene segmentation and object detection.
- Semantic Video Search: Enables users to search videos using natural language queries to find specific events or objects. The LLM uses tool use, referring to extracted image features in order to ground the search. 
- Similarity Search: Allows users to upload a reference image and find all appearances of similar people or objects across all videos.
- Case Linking: Identifies links between different cases based on similar people or objects detected in the videos. Relies on generative AI to reason about similarity of features. Includes tool use to relate cases.
- Multi-Camera Timeline: Reconstructs the movements of people or objects across multiple cameras and presents them in a unified timeline.
- User-friendly Dashboard: Provides a centralized dashboard to manage videos, searches, and cases.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to convey security and trust.
- Background color: Light gray (#F5F5F5) for a clean and professional look.
- Accent color: Teal (#009688) to highlight important actions and information.
- Body font: 'Inter', a sans-serif font for a modern, objective look and excellent readability in both headlines and body text.
- Use consistent and clear icons to represent different functionalities and data types.
- Design a clear and intuitive layout to facilitate efficient navigation and data access.
- Implement subtle animations to provide feedback and enhance the user experience.