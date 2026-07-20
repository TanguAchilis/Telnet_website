import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getWhatsAppUrl, whatsappMessages } from '../utils/whatsapp'
import { fetchShopCategories } from '../utils/content'
import './Shop.css'

// Fallback categories (used before the CMS migration is run / DB is empty).
const DEFAULT_CATEGORIES = [
    { slug: 'student-laptops', name: 'Student Laptops', description: 'Affordable, reliable laptops perfect for schoolwork, research, and everyday use.' },
    { slug: 'gaming-laptops', name: 'Gaming Laptops', description: 'High-performance machines with dedicated graphics and fast processors for gaming enthusiasts.' },
    { slug: 'business-laptops', name: 'Business Laptops', description: 'Professional-grade laptops with enhanced security, durability, and productivity features.' },
    { slug: 'desktop-screens', name: 'Desktop Screens', description: 'Quality monitors and desktop displays for workstations and office setups.' },
    { slug: 'accessories', name: 'Accessories', description: 'Keyboards, mice, chargers, bags, USB hubs, and all essential laptop accessories.' },
    { slug: 'networking-tools', name: 'Networking Tools', description: 'Routers, switches, cables, and all networking equipment for home and office setup.' },
]

const CATEGORY_ICONS = {
    'student-laptops': '🎓',
    'gaming-laptops': '🎮',
    'business-laptops': '💼',
    'desktop-screens': '🖥️',
    'accessories': '⌨️',
    'networking-tools': '🔌',
}

export default function Shop({ showHeader = true }) {
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES)

    useEffect(() => {
        fetchShopCategories()
            .then((cats) => {
                if (Array.isArray(cats) && cats.length > 0) setCategories(cats)
            })
            .catch(() => { /* keep fallback */ })
    }, [])

    return (
        <section id="shop" className="section shop-section">
            <div className="container">
                {showHeader && (
                    <div className="section-header">
                        <span className="section-label">Our Products</span>
                        <h2 className="section-title"><span className="text-gradient-accent">Shop</span></h2>
                        <p className="section-subtitle">
                            Browse our collection of quality laptops and accessories from trusted brands like HP, Dell, Lenovo, Acer and more. Choose a category to see what's available.
                        </p>
                    </div>
                )}

                <div className="shop-grid">
                    {categories.map((cat) => (
                        <Link key={cat.slug} to={`/shop/${cat.slug}`} className="shop-card animate-on-scroll">
                            {cat.image_url ? (
                                <div className="shop-card-media">
                                    <img src={cat.image_url} alt={cat.name} loading="lazy" />
                                </div>
                            ) : (
                                <span className="shop-emoji">{CATEGORY_ICONS[cat.slug] || '🛍️'}</span>
                            )}
                            <h3 className="shop-card-title">{cat.name}</h3>
                            <p className="shop-card-desc">{cat.description}</p>
                            <div className="shop-card-footer">
                                <span className="shop-browse">Browse products</span>
                                <span className="shop-arrow" aria-hidden="true">→</span>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="shop-cta animate-on-scroll">
                    <p className="shop-cta-text">
                        Can't find what you're looking for? Chat with us and we'll help you find the right device.
                    </p>
                    <a
                        href={getWhatsAppUrl(whatsappMessages.general)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                        Ask About Products
                    </a>
                </div>
            </div>
        </section>
    )
}
