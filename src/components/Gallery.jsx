import { useEffect, useState } from 'react'
import { fetchGalleryCategories, fetchGalleryImages } from '../utils/content'
import './Gallery.css'

// Fallback content (used before the CMS migration is run / DB is empty).
const DEFAULT_CATEGORIES = [
    { slug: 'trainings', name: 'IT Trainings & Internships' },
    { slug: 'girls-in-tech', name: 'Girls in Tech' },
    { slug: 'community', name: 'Community Outreach' },
    { slug: 'installations', name: 'Smart Installations' },
    { slug: 'network', name: 'Network Equipment' },
    { slug: 'computers', name: 'Computers' },
    { slug: 'accessories', name: 'Accessories' },
]

const DEFAULT_IMAGES = [
    { image_url: '/Our team/other images/training sesseions.jpg', caption: 'Training Sessions', categorySlug: 'trainings' },
    { image_url: '/Our team/other images/Presentations.jpeg', caption: 'Presentations', categorySlug: 'trainings' },
    { image_url: '/Our team/other images/practicals.jpeg', caption: 'Practical Sessions', categorySlug: 'trainings' },
    { image_url: '/Our team/other images/interns.jpeg', caption: 'Our Interns', categorySlug: 'trainings' },
    { image_url: '/Our team/other images/internship certicate awarded.jpeg', caption: 'Internship Certificates', categorySlug: 'trainings' },
    { image_url: '/Our team/other images/internship conclusion.jpeg', caption: 'Internship Conclusion', categorySlug: 'trainings' },
    { image_url: '/Our team/other images/hardware maintenance.jpeg', caption: 'Hardware Maintenance', categorySlug: 'trainings' },
    { image_url: '/Our team/other images/windows installation.jpeg', caption: 'Windows Installation', categorySlug: 'trainings' },
    { image_url: '/Our team/other images/camera installation practicals.jpeg', caption: 'Camera Installation Practicals', categorySlug: 'trainings' },
    { image_url: '/Our team/other images/girls in tech/g.jpeg', caption: 'Girls in Tech', categorySlug: 'girls-in-tech' },
    { image_url: '/Our team/other images/girls in tech/g1.jpeg', caption: 'Girls in Tech Training', categorySlug: 'girls-in-tech' },
    { image_url: '/Our team/other images/girls in tech/g2.jpeg', caption: 'Girls in Tech Workshop', categorySlug: 'girls-in-tech' },
    { image_url: '/Our team/other images/girls in tech/g3.jpeg', caption: 'Girls in Tech Program', categorySlug: 'girls-in-tech' },
    { image_url: '/Our team/other images/girls in tech/g4.jpeg', caption: 'Girls in Tech Session', categorySlug: 'girls-in-tech' },
    { image_url: '/Our team/other images/installation/camera.jpeg', caption: 'Camera Installation', categorySlug: 'installations' },
    { image_url: '/Our team/other images/installation/f.jpeg', caption: 'Field Installation', categorySlug: 'installations' },
    { image_url: '/Our team/other images/installation/f2.jpeg', caption: 'Installation Work', categorySlug: 'installations' },
    { image_url: '/Our team/other images/installation/f3.jpeg', caption: 'On-site Installation', categorySlug: 'installations' },
    { image_url: '/Our team/other images/installation/f4.jpeg', caption: 'Installation Project', categorySlug: 'installations' },
    { image_url: '/Our team/other images/installation/field work.jpeg', caption: 'Field Work', categorySlug: 'installations' },
    { image_url: '/Our team/other images/laptop.jpg', caption: 'Laptop', categorySlug: 'computers' },
    { image_url: '/Our team/other images/laptop/Dell..jpeg', caption: 'Dell Laptop', categorySlug: 'computers' },
    { image_url: '/Our team/other images/laptop/DELL.jpeg', caption: 'Dell Computer', categorySlug: 'computers' },
    { image_url: '/Our team/other images/laptop/delll.jpeg', caption: 'Dell Device', categorySlug: 'computers' },
    { image_url: '/Our team/other images/laptop/HP..jpeg', caption: 'HP Laptop', categorySlug: 'computers' },
    { image_url: '/Our team/other images/laptop/hp.jpeg', caption: 'HP Computer', categorySlug: 'computers' },
    { image_url: '/Our team/other images/laptop/HPs.jpeg', caption: 'HP Devices', categorySlug: 'computers' },
    { image_url: '/Our team/other images/laptop/L1.jpeg', caption: 'Laptop Model 1', categorySlug: 'computers' },
    { image_url: '/Our team/other images/laptop/L2.jpeg', caption: 'Laptop Model 2', categorySlug: 'computers' },
    { image_url: '/Our team/other images/laptop/l3.jpeg', caption: 'Laptop Model 3', categorySlug: 'computers' },
    { image_url: '/Our team/other images/laptop/l4.jpeg', caption: 'Laptop Model 4', categorySlug: 'computers' },
    { image_url: '/Our team/other images/laptop/laptop.jpg', caption: 'Laptop Display', categorySlug: 'computers' },
    { image_url: '/Our team/other images/laptop/macbook.jpeg', caption: 'MacBook', categorySlug: 'computers' },
    { image_url: '/Our team/other images/accessories/calculators.jpeg', caption: 'Calculators', categorySlug: 'accessories' },
    { image_url: '/Our team/other images/accessories/display cable.jpeg', caption: 'Display Cable', categorySlug: 'accessories' },
    { image_url: '/Our team/other images/accessories/HDMI and VGA adapter.jpeg', caption: 'HDMI & VGA Adapter', categorySlug: 'accessories' },
    { image_url: '/Our team/other images/accessories/portable laptop bags.jpeg', caption: 'Portable Laptop Bags', categorySlug: 'accessories' },
    { image_url: '/Our team/other images/camera.jpeg', caption: 'Camera Equipment', categorySlug: 'network' },
    { image_url: '/Our team/other images/network equipments/utility knives.jpeg', caption: 'Utility Knives', categorySlug: 'network' },
]

export default function Gallery({ showHeader = true }) {
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
    const [images, setImages] = useState(DEFAULT_IMAGES)
    const [lightbox, setLightbox] = useState(null)
    const [activeCategory, setActiveCategory] = useState('all')

    useEffect(() => {
        let active = true
        Promise.all([fetchGalleryCategories(), fetchGalleryImages()])
            .then(([cats, imgs]) => {
                if (!active) return
                if (Array.isArray(imgs) && imgs.length > 0) {
                    setImages(imgs.map((img) => ({
                        image_url: img.image_url,
                        caption: img.caption,
                        categorySlug: img.category?.slug || null,
                        categoryName: img.category?.name || null,
                    })))
                    if (Array.isArray(cats) && cats.length > 0) {
                        setCategories(cats.map((c) => ({ slug: c.slug, name: c.name })))
                    }
                }
            })
            .catch(() => { /* keep fallback */ })
        return () => { active = false }
    }, [])

    const allCategories = [{ slug: 'all', name: 'All' }, ...categories]
    const categoryName = (slug) => categories.find((c) => c.slug === slug)?.name || slug

    const filtered = activeCategory === 'all'
        ? images
        : images.filter((img) => img.categorySlug === activeCategory)

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
                    {allCategories.map((cat) => (
                        <button
                            key={cat.slug}
                            className={`gallery-cat-btn${activeCategory === cat.slug ? ' active' : ''}`}
                            onClick={() => setActiveCategory(cat.slug)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                <div className="gallery-grid">
                    {filtered.length > 0 ? (
                        filtered.map((img, index) => (
                            <div
                                key={`${img.image_url}-${index}`}
                                className="gallery-item animate-on-scroll"
                                onClick={() => setLightbox(index)}
                            >
                                <img src={img.image_url} alt={img.caption || ''} loading="lazy" />
                                <div className="gallery-overlay">
                                    <span className="gallery-tag">
                                        {img.categoryName || categoryName(img.categorySlug)}
                                    </span>
                                    <span className="gallery-title">{img.caption}</span>
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
                    <img src={filtered[lightbox].image_url} alt={filtered[lightbox].caption || ''} className="lightbox-image" onClick={(e) => e.stopPropagation()} />
                    <button className="lightbox-nav lightbox-next" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % filtered.length) }}>›</button>
                    <p className="lightbox-caption">{filtered[lightbox].caption}</p>
                </div>
            )}
        </section>
    )
}
