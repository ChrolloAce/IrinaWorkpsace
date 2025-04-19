# Permit Management Dashboard

A modern web application for managing client permits, tracking progress, and organizing permit-related tasks.

## Features

- Dashboard overview with key metrics and recent permits
- Client management system
- Permit creation and tracking
- Checklist functionality for each permit
- Clean, modern UI based on the provided design

## Tech Stack

- Next.js 14+ (React framework)
- TypeScript
- Tailwind CSS for styling
- Vercel for deployment

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js (v18.0.0 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd permit-management-dashboard
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
/src
  /app             # Next.js app directory
    /clients       # Client management pages
    /permits       # Permit management pages
    /checklists    # Checklist pages
    page.tsx       # Dashboard home page
  /components      # Reusable React components
    /layout        # Layout components like Sidebar and Header
    /ui            # UI components
    /clients       # Client-specific components
    /permits       # Permit-specific components
  /lib             # Utility functions and data services
  /styles          # Global styles
/public            # Static assets
```

## Deployment

This application is configured for deployment on Vercel:

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Deploy the application

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 