import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getWhatsAppUrl, whatsappMessages } from '../utils/whatsapp'
import { fetchShopCategories } from '../utils/content'
import { Icon, resolveIconName } from '../icons'
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

// Categories the CMS ships with. Anything added later falls back to the
// category's own `icon` column, then to the generic bag.
const CATEGORY_ICONS = {
    'student-laptops': 'graduation',
    'gaming-laptops': 'gamepad',
    'business-laptops': 'briefcase',
    'desktop-screens': 'monitor',
    'accessories': 'keyboard',
    'networking-tools': 'network',
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
                                <span className="shop-card-icon">
                                    <Icon name={CATEGORY_ICONS[cat.slug] || resolveIconName(cat.icon, 'bag')} size={28} />
                                </span>
                            )}
                            <h3 className="shop-card-title">{cat.name}</h3>
                            <p className="shop-card-desc">{cat.description}</p>
                            <div className="shop-card-footer">
                                <span className="shop-browse">Browse products</span>
                                <Icon name="arrow-right" size={17} className="shop-arrow" />
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
                        <Icon name="whatsapp" size={18} />
                        Ask About Products
                    </a>
                </div>
            </div>
        </section>
    )
}
