import { useState } from 'react'
import './Gallery.css'

const categories = [
    { key: 'all', label: 'All' },
    { key: 'trainings', label: 'IT Trainings & Internships' },
    { key: 'girls-in-tech', label: 'Girls in Tech' },
    { key: 'community', label: 'Community Outreach' },
    { key: 'installations', label: 'Smart Installations' },
    { key: 'network', label: 'Network Equipment' },
    { key: 'computers', label: 'Computers' },
    { key: 'accessories', label: 'Accessories' },
]

const images = [
    // Trainings & Internships
    { src: '/Our team/other images/training sesseions.jpg', alt: 'Training Sessions', category: 'trainings' },
    { src: '/Our team/other images/Presentations.jpeg', alt: 'Presentations', category: 'trainings' },
    { src: '/Our team/other images/practicals.jpeg', alt: 'Practical Sessions', category: 'trainings' },
    { src: '/Our team/other images/interns.jpeg', alt: 'Our Interns', category: 'trainings' },
    { src: '/Our team/other images/internship certicate awarded.jpeg', alt: 'Internship Certificates', category: 'trainings' },
    { src: '/Our team/other images/internship conclusion.jpeg', alt: 'Internship Conclusion', category: 'trainings' },
    { src: '/Our team/other images/hardware maintenance.jpeg', alt: 'Hardware Maintenance', category: 'trainings' },
    { src: '/Our team/other images/windows installation.jpeg', alt: 'Windows Installation', category: 'trainings' },
    { src: '/Our team/other images/camera installation practicals.jpeg', alt: 'Camera Installation Practicals', category: 'trainings' },
    // Girls in Tech
    { src: '/Our team/other images/girls in tech/g.jpeg', alt: 'Girls in Tech', category: 'girls-in-tech' },
    { src: '/Our team/other images/girls in tech/g1.jpeg', alt: 'Girls in Tech Training', category: 'girls-in-tech' },
    { src: '/Our team/other images/girls in tech/g2.jpeg', alt: 'Girls in Tech Workshop', category: 'girls-in-tech' },
    { src: '/Our team/other images/girls in tech/g3.jpeg', alt: 'Girls in Tech Program', category: 'girls-in-tech' },
    { src: '/Our team/other images/girls in tech/g4.jpeg', alt: 'Girls in Tech Session', category: 'girls-in-tech' },
    // Installations
    { src: '/Our team/other images/installation/camera.jpeg', alt: 'Camera Installation', category: 'installations' },
    { src: '/Our team/other images/installation/f.jpeg', alt: 'Field Installation', category: 'installations' },
    { src: '/Our team/other images/installation/f2.jpeg', alt: 'Installation Work', category: 'installations' },
    { src: '/Our team/other images/installation/f3.jpeg', alt: 'On-site Installation', category: 'installations' },
    { src: '/Our team/other images/installation/f4.jpeg', alt: 'Installation Project', category: 'installations' },
    { src: '/Our team/other images/installation/field work.jpeg', alt: 'Field Work', category: 'installations' },
    // Computers / Laptops
    { src: '/Our team/other images/laptop.jpg', alt: 'Laptop', category: 'computers' },
    { src: '/Our team/other images/laptop/Dell..jpeg', alt: 'Dell Laptop', category: 'computers' },
    { src: '/Our team/other images/laptop/DELL.jpeg', alt: 'Dell Computer', category: 'computers' },
    { src: '/Our team/other images/laptop/delll.jpeg', alt: 'Dell Device', category: 'computers' },
    { src: '/Our team/other images/laptop/HP..jpeg', alt: 'HP Laptop', category: 'computers' },
    { src: '/Our team/other images/laptop/hp.jpeg', alt: 'HP Computer', category: 'computers' },
    { src: '/Our team/other images/laptop/HPs.jpeg', alt: 'HP Devices', category: 'computers' },
    { src: '/Our team/other images/laptop/L1.jpeg', alt: 'Laptop Model 1', category: 'computers' },
    { src: '/Our team/other images/laptop/L2.jpeg', alt: 'Laptop Model 2', category: 'computers' },
    { src: '/Our team/other images/laptop/l3.jpeg', alt: 'Laptop Model 3', category: 'computers' },
    { src: '/Our team/other images/laptop/l4.jpeg', alt: 'Laptop Model 4', category: 'computers' },
    { src: '/Our team/other images/laptop/laptop.jpg', alt: 'Laptop Display', category: 'computers' },
    { src: '/Our team/other images/laptop/macbook.jpeg', alt: 'MacBook', category: 'computers' },
    // Accessories
    { src: '/Our team/other images/accessories/calculators.jpeg', alt: 'Calculators', category: 'accessories' },
    { src: '/Our team/other images/accessories/display cable.jpeg', alt: 'Display Cable', category: 'accessories' },
    { src: '/Our team/other images/accessories/HDMI and VGA adapter.jpeg', alt: 'HDMI & VGA Adapter', category: 'accessories' },
    { src: '/Our team/other images/accessories/portable laptop bags.jpeg', alt: 'Portable Laptop Bags', category: 'accessories' },
    // Network Equipment
    { src: '/Our team/other images/camera.jpeg', alt: 'Camera Equipment', category: 'network' },
    { src: '/Our team/other images/network equipments/utility knives.jpeg', alt: 'Utility Knives', category: 'network' },
]

export default function Gallery({ showHeader = true }) {
    const [lightbox, setLightbox] = useState(null)
    const [activeCategory, setActiveCategory] = useState('all')

    const filtered = activeCategory === 'all'
        ? images
        : images.filter(img => img.category === activeCategory)

    return (
        <section id="gallery" className="section gallery-section">
            <div className="container">
                {showHeader && (
                    <div className="section-header">
                        <span className="section-label">Our Work</span>
                        <h2 className="section-title">Gallery</h2>
                        <p className="section-subtitle">
                            A glimpse into our training sessions, installations, and community impact.
                        </p>
                    </div>
                )}

                <div className="gallery-categories">
                    {categories.map(cat => (
                        <button
                            key={cat.key}
                            className={`gallery-cat-btn${activeCategory === cat.key ? ' active' : ''}`}
                            onClick={() => setActiveCategory(cat.key)}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="gallery-grid">
                    {filtered.length > 0 ? (
                        filtered.map((img, index) => (
                            <div
                                key={img.src}
                                className="gallery-item animate-on-scroll"
                                onClick={() => setLightbox(index)}
                            >
                                <img src={img.src} alt={img.alt} loading="lazy" />
                                <div className="gallery-overlay">
                                    <span className="gallery-tag">
                                        {categories.find(c => c.key === img.category)?.label || img.category}
                                    </span>
                                    <span className="gallery-title">{img.alt}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="gallery-empty">
                            <p>No images in this category yet. Check back soon!</p>
                        </div>
                    )}
                </div>
            </div>

            {lightbox !== null && filtered[lightbox] && (
                <div className="lightbox" onClick={() => setLightbox(null)}>
                    <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
                    <button className="lightbox-nav lightbox-prev" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + filtered.length) % filtered.length) }}>‹</button>
                    <img src={filtered[lightbox].src} alt={filtered[lightbox].alt} className="lightbox-image" onClick={(e) => e.stopPropagation()} />
                    <button className="lightbox-nav lightbox-next" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % filtered.length) }}>›</button>
                    <p className="lightbox-caption">{filtered[lightbox].alt}</p>
                </div>
            )}
        </section>
    )
}
