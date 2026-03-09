import { getWhatsAppUrl, whatsappMessages } from '../utils/whatsapp'
import './Shop.css'

const categories = [
    {
        title: 'Student Laptops',
        desc: 'Affordable, reliable laptops perfect for schoolwork, research, and everyday use.',
        icon: '🎓',
        priceRange: 'From 80,000 FCFA',
        whatsappKey: 'studentLaptops',
    },
    {
        title: 'Gaming Laptops',
        desc: 'High-performance machines with dedicated graphics and fast processors for gaming enthusiasts.',
        icon: '🎮',
        priceRange: 'From 200,000 FCFA',
        whatsappKey: 'gamingLaptops',
    },
    {
        title: 'Business Laptops',
        desc: 'Professional-grade laptops with enhanced security, durability, and productivity features.',
        icon: '💼',
        priceRange: 'From 150,000 FCFA',
        whatsappKey: 'businessLaptops',
    },
    {
        title: 'Desktop Screens',
        desc: 'Quality monitors and desktop displays for workstations and office setups.',
        icon: '🖥️',
        priceRange: 'From 40,000 FCFA',
        whatsappKey: 'desktopScreens',
    },
    {
        title: 'Accessories',
        desc: 'Keyboards, mice, chargers, bags, USB hubs, and all essential laptop accessories.',
        icon: '⌨️',
        priceRange: 'From 2,000 FCFA',
        whatsappKey: 'accessories',
    },
    {
        title: 'Networking Tools',
        desc: 'Routers, switches, cables, and all networking equipment for home and office setup.',
        icon: '🔌',
        priceRange: 'From 5,000 FCFA',
        whatsappKey: 'networkingTools',
    },
]

export default function Shop({ showHeader = true }) {
    return (
        <section id="shop" className="section shop-section">
            <div className="container">
                {showHeader && (
                    <div className="section-header">
                        <span className="section-label">Our Products</span>
                        <h2 className="section-title"><span className="text-gradient-accent">Shop</span></h2>
                        <p className="section-subtitle">
                            Quality laptops and accessories from trusted brands — HP, Dell, Lenovo, Acer and more.
                        </p>
                    </div>
                )}

                <div className="shop-grid">
                    {categories.map((cat, index) => (
                        <div key={index} className="shop-card glass-card animate-on-scroll">
                            <span className="shop-emoji">{cat.icon}</span>
                            <h3 className="shop-card-title">{cat.title}</h3>
                            <p className="shop-card-desc">{cat.desc}</p>
                            <div className="shop-card-footer">
                                <span className="shop-price">{cat.priceRange}</span>
                                <a
                                    href={getWhatsAppUrl(whatsappMessages[cat.whatsappKey])}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shop-inquiry-btn"
                                >
                                    💬 Inquire →
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="shop-cta animate-on-scroll">
                    <p className="shop-cta-text">
                        All products come with reliable support and guidance to help you choose the right device.
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
