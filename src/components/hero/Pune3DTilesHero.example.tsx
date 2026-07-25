// Example usage of Pune3DTilesHero component
// Add this to your landing page or create a dedicated route

import Pune3DTilesHero from '@/components/hero/Pune3DTilesHero';

export default function LandingPage() {
    return (
        <main>
            {/* Full-screen 3D Pune Hero */}
            <Pune3DTilesHero />

            {/* Rest of your landing page content */}
            <section className="min-h-screen bg-black">
                {/* Your content here */}
            </section>
        </main>
    );
}

// Or create a dedicated route at app/3d-pune/page.tsx
export default function Pune3DPage() {
    return <Pune3DTilesHero />;
}
